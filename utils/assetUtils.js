import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system/legacy';

/**
 * Convert an asset module to base64 data URI
 * @param {any} assetModule - The require() asset module
 * @returns {Promise<string>} Base64 data URI
 */
export const assetToBase64 = async (assetModule) => {
  try {
    const asset = Asset.fromModule(assetModule);
    await asset.downloadAsync();
    const base64 = await FileSystem.readAsStringAsync(asset.localUri, { 
      encoding: 'base64' 
    });
    return `data:image/png;base64,${base64}`;
  } catch (error) {
    console.error('Error converting asset to base64:', error);
    return null;
  }
};

/**
 * Load multiple assets as base64 data URIs
 * @param {Object} assets - Object with asset modules
 * @returns {Promise<Object>} Object with base64 data URIs
 */
export const loadAssetsAsBase64 = async (assets) => {
  const result = {};
  const entries = Object.entries(assets);
  
  for (const [key, assetModule] of entries) {
    result[key] = await assetToBase64(assetModule);
  }
  
  return result;
};
