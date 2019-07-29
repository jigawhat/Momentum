const createWindowsInstaller = require('electron-winstaller').createWindowsInstaller
const path = require('path')

getInstallerConfig()
  .then(createWindowsInstaller)
  .catch((error) => {
    console.error(error.message || error)
    process.exit(1)
  })

function getInstallerConfig () {
  console.log('Creating windows installer...')
  const rootPath = path.join('./')
  const outPath = path.join(rootPath, 'release-builds')

  return Promise.resolve({
    appDirectory: path.join(outPath, 'Momentum-win32-x64/'),
    authors: 'Alfonso White',
    noMsi: true,
    outputDirectory: path.join(outPath, 'windows-installer'),
    exe: 'Momentum.exe',
    setupExe: 'MomentumInstaller.exe',
    setupIcon: path.join(rootPath, 'img', '8ball.ico')
  })
}