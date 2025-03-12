// postcss.config.js
module.exports = {
  plugins: {
    autoprefixer: {},
    'postcss-preset-env': {
      stage: 3, // ou n'importe quel autre paramètre que vous souhaitez
    },
  },
};
