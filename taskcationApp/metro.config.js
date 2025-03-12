
const { getDefaultConfig } = require('metro-config');

module.exports = (async () => {
    const {
        resolver: { assetExts, sourceExts },
    } = await getDefaultConfig();
    return {
        resolver: {
            // Add "bin" (and "json" if needed) to assetExts:
            assetExts: [...assetExts, 'bin', 'json'],
            sourceExts: [...sourceExts, 'js', 'jsx', 'ts', 'tsx'],
        },
    };
})();
