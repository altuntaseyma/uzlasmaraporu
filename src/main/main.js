// src/main/main.js
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const wordService = require('./services/wordService');
const uzlastirmaciService = require('../database/services/uzlastirmaciService');
const lokasyonService = require('../database/services/lokasyonService');
const sucService = require('../database/services/sucService');
const { pool } = require('../database/config');
const isDev = process.argv.includes('--dev');

// Veritabanı bağlantısını global olarak tanımla
global.db = pool;

function createWindow() {
    const win = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        },
        title: "Uzlaştırma Rapor Sistemi",
    });

    // Geliştirme modunda React dev server'a bağlan
    if (isDev) {
        win.loadURL('http://localhost:3000');
        win.webContents.openDevTools();
        win.on('closed', () => {
            console.log('Window closed');
        });
    } else {
        win.loadFile(path.join(__dirname, '../../build/index.html'));
    }
    
    // Menüyü gizle
    win.setMenuBarVisibility(false);
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

// Word servisi için IPC handler
ipcMain.handle('create-report', async (event, data, fileName) => {
    try {
        return await wordService.createReport(data, fileName);
    } catch (error) {
        console.error('Rapor oluşturulurken hata:', error);
        throw error;
    }
});

ipcMain.handle('create-offer-form', async (event, data, fileName) => {
    try {
        return await wordService.createOfferForm(data, fileName);
    } catch (error) {
        console.error('Teklif formu oluşturulurken hata:', error);
        throw error;
    }
});

// Uzlaştırmacı servisi için IPC handlers
ipcMain.handle('uzlastirmaci-ekle', async (event, data) => {
    try {
        return await uzlastirmaciService.ekle(data);
    } catch (error) {
        console.error('Uzlaştırmacı eklenirken hata:', error);
        throw error;
    }
});

ipcMain.handle('uzlastirmaci-tumunu-getir', async () => {
    try {
        return await uzlastirmaciService.tumunuGetir();
    } catch (error) {
        console.error('Uzlaştırmacılar getirilirken hata:', error);
        throw error;
    }
});

ipcMain.handle('uzlastirmaci-getir-by-id', async (event, id) => {
    try {
        return await uzlastirmaciService.getirById(id);
    } catch (error) {
        console.error('Uzlaştırmacı getirilirken hata:', error);
        throw error;
    }
});

ipcMain.handle('uzlastirmaci-guncelle', async (event, id, data) => {
    try {
        return await uzlastirmaciService.guncelle(id, data);
    } catch (error) {
        console.error('Uzlaştırmacı güncellenirken hata:', error);
        throw error;
    }
});

ipcMain.handle('uzlastirmaci-sil', async (event, id) => {
    try {
        return await uzlastirmaciService.sil(id);
    } catch (error) {
        console.error('Uzlaştırmacı silinirken hata:', error);
        throw error;
    }
});

// Lokasyon servisi için IPC handlers
ipcMain.handle('lokasyon-tum-illeri-getir', async () => {
    try {
        return await lokasyonService.tumIlleriGetir();
    } catch (error) {
        console.error('İller getirilirken hata:', error);
        throw error;
    }
});

ipcMain.handle('lokasyon-ilceleri-getir', async (event, ilId) => {
    try {
        return await lokasyonService.ilceleriGetir(ilId);
    } catch (error) {
        console.error('İlçeler getirilirken hata:', error);
        throw error;
    }
});

// Suç servisi için IPC handler
ipcMain.handle('suc-tumunu-getir', async () => {
    try {
        return await sucService.tumSuclariGetir();
    } catch (error) {
        console.error('Suçlar getirilirken hata:', error);
        throw error;
    }
});