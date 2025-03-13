const express = require("express");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const session = require("express-session");
const cors = require("cors");
const { PrismaClient } = require("@prisma/client");
const { Strategy: GoogleStrategy } = require("passport-google-oauth20");


// Importer le cron job
require('./cronJob.js');


dotenv.config();
const prisma = new PrismaClient();
const app = express();
const fs = require("fs");

const generateToken = (user) => {
  return jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "7d" });
};


// Vérifier si les variables d'environnement sont bien chargées
console.log("Google Client ID:", process.env.GOOGLE_CLIENT_ID);
console.log("Google Client Secret:", process.env.GOOGLE_CLIENT_SECRET);
console.log("JWT Secret:", process.env.JWT_SECRET);

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(
  session({ secret: process.env.JWT_SECRET, resave: false, saveUninitialized: false })
);
app.use(passport.initialize());
app.use(passport.session());

app.post("/refresh-token", (req, res) => {
  const token = req.body.token;

  if (!token) {
    return res.status(401).json({ message: "Token manquant" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Token invalide ou expiré" });
    }

    const newToken = generateToken({ id: decoded.id });
    res.json({ token: newToken });
  });
});

async function insertStudents() {
  try {
    // Lire le fichier JSON
    const data = fs.readFileSync("students.json", "utf-8");
    const students = JSON.parse(data);

    for (const student of students) {
      // Vérifier si campusId est une chaîne, et le convertir en entier
      const campusId = parseInt(student.campusId, 10);

      if (isNaN(campusId)) {
        console.log(`❌ L'ID du campus est invalide pour ${student.firstName} ${student.lastName}`);
        continue;
      }

      // Vérifier si le campus existe
      const campusExists = await prisma.campus.findUnique({
        where: { id: campusId },
      });

      if (!campusExists) {
        console.log(`❌ Campus introuvable pour ${student.firstName} ${student.lastName}`);
        continue;
      }

      // Vérifier si l'étudiant existe déjà par matricule
      const existingStudent = await prisma.student.findUnique({
        where: { matricule: student.matricule },
      });

      if (existingStudent) {
        console.log(`❌ L'étudiant ${student.firstName} ${student.lastName} avec le matricule ${student.matricule} existe déjà.`);
        continue; // Passer à l'étudiant suivant sans tenter d'insertion
      }

      // Créer l'email basé sur le matricule
      const email = `${student.matricule}@etu.he2b.be`;

      // Ajouter l'étudiant avec l'ID de campus valide
      await prisma.student.create({
        data: {
          matricule: student.matricule,
          lastName: student.lastName,
          firstName: student.firstName,
          email: email, // Utiliser l'email généré
          campusId: campusId,
        },
      });

      console.log(`✅ Étudiant ajouté : ${student.firstName} ${student.lastName}`);
    }

    console.log("✅ Tous les étudiants ont été insérés !");
  } catch (error) {
    console.error("❌ Erreur lors de l'insertion :", error);
  } finally {
    await prisma.$disconnect(); // Ajouter les parenthèses pour fermer la connexion
  }
}



app.post("/import-students", async (req, res) => {
  try {
    console.log("✅ Démarrage de l'importation des étudiants...");

    await insertStudents(); // Appel à la fonction d'insertion
    res.status(200).json({ message: "Tous les étudiants ont été ajoutés avec succès !" });
  } catch (error) {
    console.error("❌ Erreur lors de l'importation des étudiants :", error);
    res.status(500).json({ message: "Erreur serveur lors de l'importation des étudiants", error: error.message });
  }
});




// 🔹 Authentification Google

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      console.log("Profil Google récupéré :", profile); // Debugging

      const email = profile.emails[0].value;
      const nameParts = profile.displayName.split(" ");
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "";
      const matricule = email.split("@")[0]; // Récupérer la partie avant '@'

      let user = null;

      if (email.endsWith("@etu.he2b.be")) {
        // 🔹 Vérifier si l'étudiant existe déjà
        user = await prisma.student.findUnique({ where: { email } });

        if (!user) {
          // 🔹 Créer un nouvel étudiant si non existant
          user = await prisma.student.create({
            data: {
              email,
              firstName,
              lastName,
              matricule,
              campus: {
                connect: {
                  id: campusId,  // Vous devez connecter l'étudiant à un campus existant par son `id`.
                },
              },
            },
          });
        }          
      } else if (email.endsWith("@he2b.be")) {
        // 🔹 Vérifier si l'enseignant/staff existe déjà
        user = await prisma.teacher.findUnique({ where: { email } });

        if (!user) {
          // 🔹 Créer un nouvel enseignant si non existant
          user = await prisma.teacher.create({
            data: {
              email,
              firstName,
              lastName,
            },
          });
        }
      } else {
        return done(null, false, { message: "Domaine email non autorisé." });
      }

      const token = generateToken(user);
      console.log("Utilisateur authentifié, token généré :", token);

      return done(null, { user, token });
    }
  )
);


passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

// 🔹 Route pour initier l'authentification Google
app.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));

// 🔹 Route de callback après authentification Google
// Exemple de redirection avec token JWT dans l'URL après authentification réussie
app.get("/auth/google/callback", passport.authenticate("google", { failureRedirect: "/" }), (req, res) => {
  const token = generateToken(req.user.user);
  res.redirect(`http://localhost:5173/token?token=${token}`); // 🔹 Envoi le token dans l'URL
});




// 🔹 Récupérer les infos de l'utilisateur
app.get("/user", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    console.log("⛔ Token manquant !");
    return res.status(401).json({ message: "Token manquant" });
  }

  jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
    if (err) {
      console.log("⛔ Token invalide :", err);
      return res.status(401).json({ message: "Token invalide" });
    }

    console.log("✅ Token valide, ID utilisateur :", decoded.id);

    const user = await prisma.student.findUnique({
      where: { email: decoded.email }, 
      select: { 
        id: true, 
        email: true, 
        firstName: true, 
        lastName: true,
        campus: { select: { name: true } } 
      }
    });
    
    // Vérifier si l'utilisateur existe avant d'afficher l'email
    if (user) {
      console.log("Email récupéré :", user.email);
    } else {
      console.log("Aucun utilisateur trouvé avec cet email.");
    }
    if (!user) {
      console.log("⛔ Utilisateur introuvable !");
      return res.status(404).json({ message: "Utilisateur introuvable" });
    }
    console.log("✅ Campus trouvé :", user.campus );
    console.log("✅ Utilisateur trouvé :", user);
    return res.json(user);
  });
});


// 🔹 Récupérer tous les enseignants
app.get("/teachers", async (req, res) => {
  console.log("📢 GET /teachers appelé !");
  
  try {
    const teachers = await prisma.teacher.findMany();
    res.json(teachers);
  } catch (error) {
    console.error("⛔ Erreur serveur :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

app.get('/teachers/email/:email', async (req, res) => {
  const email = req.params.email;

  try {
    // Remplacez `Teacher.findOne` par `prisma.teacher.findUnique`
    const teacher = await prisma.teacher.findUnique({
      where: { email }
    });

    if (teacher) {
      res.json(teacher);  // Si l'enseignant est trouvé, retournez les données
    } else {
      res.status(404).json({ message: 'Professeur non trouvé' }); // Si l'enseignant n'est pas trouvé
    }
  } catch (error) {
    console.error("Erreur lors de la recherche :", error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Exemple de code dans votre route /attendance sur le serveur backend

app.post('/attendance', async (req, res) => {
  const { teacherId, presence } = req.body;

  // Vérifier les données reçues
  console.log("Données reçues : ", { teacherId, presence });

  if (!teacherId || typeof presence === 'undefined') {
    return res.status(400).json({ error: "Teacher ID and presence are required" });
  }

  try {
    const existingAttendance = await prisma.attendance.findUnique({
      where: {
        teacherId_timestamp: {
          teacherId,
          timestamp: new Date().toISOString().split('T')[0], // Date actuelle
        },
      },
    });

    console.log("Présence existante trouvée : ", existingAttendance);

    if (existingAttendance) {
      // Si une présence existe déjà, la mettre à jour
      const updatedAttendance = await prisma.attendance.update({
        where: { id: existingAttendance.id },
        data: { present: presence },
      });
      console.log("Présence mise à jour : ", updatedAttendance);
      res.status(200).json(updatedAttendance);
    } else {
      // Si aucune présence n'existe, créer une nouvelle entrée
      const newAttendance = await prisma.attendance.create({
        data: {
          teacherId,
          present: presence,
        },
      });
      console.log("Nouvelle présence créée : ", newAttendance);
      res.status(201).json(newAttendance);
    }
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la présence:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});



// 🔹 Ajouter un enseignant
app.post("/teachers", async (req, res) => {
  const { firstName, lastName, campusId } = req.body;

  if (!firstName || !lastName || !campusId) {
    return res.status(400).json({ message: "Données incomplètes" });
  }

  // Générer l'email : [initial]@he2b.be
  const email = `${firstName[0].toLowerCase()}${lastName.toLowerCase()}@he2b.be`;

  try {
    const newTeacher = await prisma.teacher.create({
      data: { firstName, lastName, email, campusId }
    });

    res.status(201).json(newTeacher);
  } catch (error) {
    console.error("⛔ Erreur lors de l'ajout :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// 🔹 Supprimer un enseignant
app.delete("/teachers/:id", async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.teacher.delete({ where: { id: parseInt(id) } });
    res.json({ message: "Professeur supprimé" });
  } catch (error) {
    console.error("⛔ Erreur lors de la suppression :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});



// 🔹 Récupérer le profil utilisateur
app.get("/profile", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Token manquant" });
  }

  jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Token invalide" });
    }

    const user = await prisma.user.findUnique({ 
      where: { id: decoded.id },
      select: { id: true, googleId: true, email: true, name: true, campus: { select: { name: true } } }
    });
    
    

    if (!user) {
      return res.status(404).json({ message: "Utilisateur introuvable" });
    }

    console.log("Utilisateur récupéré :", user);
    return res.json(user);
  });
});

app.put("/api/updateProfile", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Token manquant" });
  }

  jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Token invalide" });
    }

    const { firstName, lastName } = req.body;

    if (!firstName || !lastName) {
      return res.status(400).json({ message: "Prénom et nom sont requis" });
    }

    const updatedUser = await prisma.user.update({
      where: { id: decoded.id },
      data: {
        name: `${firstName} ${lastName}`,
      },
    });

    if (!updatedUser) {
      return res.status(404).json({ message: "Utilisateur introuvable" });
    }

    res.json(updatedUser);
  });
});




// Campus side code

app.get("/campuses", async (req, res) => {
  try {
    const campuses = await prisma.campus.findMany({
      include: { users: true }, // Inclut les utilisateurs liés au campus
    });
    res.json(campuses);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la récupération des campus", error });
  }
});

app.post("/campuses", async (req, res) => {
  const { name } = req.body;

  try {
    const newCampus = await prisma.campus.create({
      data: { name },
    });
    res.status(201).json(newCampus);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la création du campus", error });
  }
});

app.put("/users/:id/campus", async (req, res) => {
  const { id } = req.params;
  const { campusId } = req.body;

  try {
    const updatedUser = await prisma.user.update({
      where: { id },
      data: { campusId },
    });
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la mise à jour du campus de l'utilisateur", error });
  }
});

// Students side code

app.post("/students", async (req, res) => {
  const { firstName, lastName, matricule, campusId } = req.body;

  // Convertir campusId en entier
  const campusIdInt = parseInt(campusId, 10);

  // Vérifier si le campusId existe dans la base de données
  const campusExists = await prisma.campus.findUnique({
    where: { id: campusIdInt },  // Utiliser campusId converti en entier
  });

  if (!campusExists) {
    // Si le campus n'existe pas, retourner une erreur
    return res.status(400).json({ message: "Le campus n'existe pas." });
  }

  if (!campusId) {
    return res.status(400).json({ message: "Le campusId est requis." });
  }

  const email = `${matricule}@etu.he2b.be`;

  try {
    const newStudent = await prisma.student.create({
      data: { firstName, lastName, matricule, email, campusId: campusIdInt },
    });
    res.status(201).json(newStudent);
  } catch (error) {
    console.error("Erreur lors de la création de l'étudiant", error);
    res.status(500).json({ message: "Erreur lors de la création de l'étudiant", error: error.message });
  }
});



app.get("/students", async (req, res) => {
  try {
    const students = await prisma.student.findMany({
      include: { campus: true }, // Inclure le campus lié à l'étudiant
    });
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la récupération des étudiants", error });
  }
});

app.put("/students/:id", async (req, res) => {
  const { id } = req.params;
  const { firstName, lastName, matricule, campusId } = req.body;

  try {
    const updatedStudent = await prisma.student.update({
      where: { id: parseInt(id) },
      data: { firstName, lastName, matricule, campusId },
    });
    res.json(updatedStudent);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la mise à jour de l'étudiant", error });
  }
});

app.delete("/students/:id", async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.student.delete({ where: { id: parseInt(id) } });
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la suppression de l'étudiant", error });
  }
});


// 🔹 Déconnexion (inutile avec JWT, mais peut être utilisé pour frontend)
app.post("/logout", (req, res) => {
  res.json({ message: "Déconnexion réussie" });
});


// 🔹 Créer une nouvelle news
app.post("/news", async (req, res) => {
  const { title, description, imageUrl, links, campusId } = req.body;

  if (!title || !description || !campusId) {
    return res.status(400).json({ message: "Données incomplètes" });
  }

  try {
    const newNews = await prisma.news.create({
      data: { title, description, imageUrl, links, campusId },
    });
    res.status(201).json(newNews);
  } catch (error) {
    console.error("⛔ Erreur lors de l'ajout :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// 🔹 Récupérer toutes les news
app.get("/news", async (req, res) => {
  try {
    const newsList = await prisma.news.findMany({
      include: { campus: true }, // Inclut les infos du campus
      orderBy: { createdAt: "desc" }, // Trier par date de création
    });
    res.json(newsList);
  } catch (error) {
    console.error("⛔ Erreur serveur :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// 🔹 Récupérer les news d'un campus spécifique
app.get("/news/campus/:campusId", async (req, res) => {
  const { campusId } = req.params;

  try {
    const newsList = await prisma.news.findMany({
      where: { campusId: parseInt(campusId) },
      orderBy: { createdAt: "desc" },
    });
    res.json(newsList);
  } catch (error) {
    console.error("⛔ Erreur serveur :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// 🔹 Modifier une news
app.put("/news/:id", async (req, res) => {
  const { id } = req.params;
  const { title, description, imageUrl, links } = req.body;

  try {
    const updatedNews = await prisma.news.update({
      where: { id: parseInt(id) },
      data: { title, description, imageUrl, links, updatedAt: new Date() },
    });
    res.json(updatedNews);
  } catch (error) {
    console.error("⛔ Erreur lors de la mise à jour :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// 🔹 Supprimer une news
app.delete("/news/:id", async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.news.delete({
      where: { id: parseInt(id) },
    });
    res.json({ message: "News supprimée avec succès" });
  } catch (error) {
    console.error("⛔ Erreur lors de la suppression :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});


// 🔹 Démarrage du serveur
app.listen(5000, () => console.log("✅ Serveur backend démarré sur http://localhost:5000"));
