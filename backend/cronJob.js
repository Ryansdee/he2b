// ./he2b/backend/cronJob.js
const cron = require('node-cron');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Planifier une tâche tous les jours à 00:01
cron.schedule('1 0 * * *', async () => {
  try {
    // Mettre à jour toutes les présences à 00:01 pour les enseignants
    await prisma.presence.updateMany({
      data: {
        presence: true,
      },
      where: {
        // Vous pouvez ajouter des conditions supplémentaires ici si nécessaire
        date: {
          lte: new Date(),  // Assurez-vous que les dates sont valides pour la mise à jour
        },
      },
    });
    console.log('Présence mise à jour avec succès.');
  } catch (error) {
    console.error('Erreur lors de la mise à jour des présences:', error);
  }
});
