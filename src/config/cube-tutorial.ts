import images from './cube-tutorial-images.json'

// Change this one base URL when moving the tutorial illustrations to a CDN.
export const cubeTutorialImageBase = '/images/rubiks-cube'
export const cubeTutorialImages = images
export type CubeTutorialImage = keyof typeof images
