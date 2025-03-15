const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
    wordService: {
        createReport: (data, fileName) => ipcRenderer.invoke('create-report', data, fileName),
        createOfferForm: (data, fileName) => ipcRenderer.invoke('create-offer-form', data, fileName)
    },
    uzlastirmaciService: {
        ekle: (data) => ipcRenderer.invoke('uzlastirmaci-ekle', data),
        tumunuGetir: () => ipcRenderer.invoke('uzlastirmaci-tumunu-getir'),
        getirById: (id) => ipcRenderer.invoke('uzlastirmaci-getir-by-id', id),
        guncelle: (id, data) => ipcRenderer.invoke('uzlastirmaci-guncelle', id, data),
        sil: (id) => ipcRenderer.invoke('uzlastirmaci-sil', id)
    },
    lokasyonService: {
        tumIlleriGetir: () => ipcRenderer.invoke('lokasyon-tum-illeri-getir'),
        ilceleriGetir: (ilId) => ipcRenderer.invoke('lokasyon-ilceleri-getir', ilId)
    },
    sucService: {
        tumSuclariGetir: () => ipcRenderer.invoke('suc-tumunu-getir')
    }
}); 