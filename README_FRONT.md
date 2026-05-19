# Front Ishlash Uchun Yo'riqnoma

Bu papka static web karta sifatida tayyorlangan. Backend kerak emas.

## Lokal Ochish

1. `START_SERVER.bat` faylini ishga tushiring.
2. Browserda oching:

```text
http://localhost:8080/
```

Oddiy `index.html`ni ikki marta bosib ochish tavsiya qilinmaydi, chunki browser `fetch()` orqali `data/*.json` va GeoJSON fayllarni o'qiydi.

## Deploy

GitHub Pages yoki Vercelga shu papkaning ichidagi fayllarni yuklash kifoya:

```text
index.html
css/
js/
assets/
data/
```

## Asosiy Fayllar

- `index.html` - sahifa tuzilishi
- `css/style.css` - dizayn
- `js/app.js` - karta logikasi
- `assets/*.jpg` - web raster qatlamlar
- `data/rasters.json` - raster bounds va fayl yo'llari
- `data/*.geojson` - viloyat va tuman chegaralari

## Raster Qatlamlar

- `lc_2017.jpg` - 2017 yer qoplami
- `lc_2020.jpg` - 2020 yer qoplami
- `lc_2024.jpg` - 2024 yer qoplami
- `change_2017_2024.jpg` - 2017-2024 o'zgarish

## Eslatma

JPEG rasterlar web uchun optimallashtirilgan. GeoTIFF va raw Sentinel fayllar eksportga qo'shilmagan.
