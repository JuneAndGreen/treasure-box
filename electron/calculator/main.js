'use strict';

const electron = require('electron');
// 控制应用生命周期的模块
const app = electron.app;
// 创建本地浏览器窗口的模块
const BrowserWindow = electron.BrowserWindow;

// 保留一个对窗口对象的全局引用。如果不这么做，窗口会在js垃圾回收的时候自动关闭
let mainWindow;

function createWindow () {
    // 创建一个浏览器窗口
    mainWindow = new BrowserWindow({
        width: 272, 
        height: 270,
        resizable: false,
        frame: false // 去掉窗口的边框和标题栏等
    });

    // 加载应用页面 -- index.html
    mainWindow.loadURL('file://' + __dirname + '/app/index.html');

    // 打开DevTools，即调试控制台
    // mainWindow.webContents.openDevTools();

    // 监听窗口关闭事件
    mainWindow.on('closed', function() {
        // 结束这个窗口对象的引用。通常在有复数窗口的应用中你会保存一个窗口数组，在这个事件中你就应该删除数组中相应的窗口了
        mainWindow = null;
    });
}

// 当Electron已经初始化完成，并准备创建对象时，则会触发这个事件
app.on('ready', createWindow);

// 当所有窗口都被关闭时
app.on('window-all-closed', function () {
    // 在OS X系统中窗口通常会留在菜单栏直到用户按下 Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', function () {
    // 在OS X系统中当其他窗口都关闭时点击图标会重新创建一个窗口
    if (mainWindow === null) {
        createWindow();
    }
});
