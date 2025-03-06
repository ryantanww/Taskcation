// babel.config.js for optimising Expo and React Native
module.exports = function (api) {
    api.cache(false);
    return {
        presets: ['babel-preset-expo'],
        plugins: [
            ['@babel/plugin-transform-runtime']
        ],
    }
}