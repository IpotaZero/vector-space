const width = 1280
const height = 960

const cvsMain = document.querySelector("#main-canvas")
cvsMain.width = width
cvsMain.height = height

const ctxMain = cvsMain.getContext("2d")

const cvsSub = document.querySelector("#sub-canvas")
cvsSub.width = width
cvsSub.height = height

const ctxSub = cvsSub.getContext("2d")
