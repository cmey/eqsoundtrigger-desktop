const { contextBridge, ipcRenderer } = require('electron')
const path = require('path')

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
  'api', {
    send: (channel, ...args) => {
      // whitelist channels
      let validChannels = ['character:add', 'character:edit']
      if (validChannels.includes(channel)) {
        ipcRenderer.send(channel, ...args)
      }
    },
    receive: (channel, func) => {
      let validChannels = ['character:add', 'triggers:clear']
      if (validChannels.includes(channel)) {
        // Deliberately strip event as it includes `sender` 
        ipcRenderer.on(channel, (event, ...args) => func(...args))
      }
    },
    // Expose app path for audio files with a safe, specific API
    getAudioPath: (filename) => {
      // Only allow specific audio file extensions for security
      const allowedExtensions = ['.mp3', '.wav', '.ogg']
      const ext = path.extname(filename)
      if (!allowedExtensions.includes(ext)) {
        return null
      }
      
      // Prevent path traversal attacks by only using the basename
      const safeName = path.basename(filename)
      const soundsDir = path.normalize(path.join(__dirname, '../sounds'))
      const fullPath = path.normalize(path.join(soundsDir, safeName))
      
      // Verify the resolved path is still within the sounds directory
      // Normalize and compare to prevent path traversal on all platforms
      if (!fullPath.startsWith(soundsDir + path.sep) && fullPath !== soundsDir) {
        return null
      }
      
      return fullPath
    }
  }
)
