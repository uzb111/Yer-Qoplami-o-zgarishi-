# Yer Qoplami O'zgarishi Monitoring Kartasi - Checklist

Sana: 2026-05-19  
Hudud: Toshkent viloyati  
Platforma: Static web karta, backend/server talab qilmaydi  
Ma'lumot manbasi: Copernicus Data Space, Sentinel-2 L2A

## 1. Ma'lumot Yuklash

- [x] Toshkent viloyati va tuman chegaralari SHP fayllari o'qildi.
- [x] Copernicus Data Space katalogidan Sentinel-2 L2A scene'lar qidirildi.
- [x] 2017, 2020, 2024 yillar tanlandi.
- [x] May-sentyabr vegetatsiya mavsumi oralig'i ishlatildi.
- [x] Toshkent viloyatini yopuvchi MGRS tile'lar aniqlab chiqildi.
- [x] Kerakli Sentinel scene'lar ZIP/SAFE ko'rinishida yuklandi.
- [x] Partial tile muammosi aniqlanib, ko'rinadigan bo'sh joy yopildi.

## 2. Qayta Ishlash

- [x] Sentinel ZIP ichidan kerakli bandlar ajratildi: B02, B03, B04, B8A, B11, SCL.
- [x] 2017, 2020, 2024 yillar bo'yicha raster mosaic tayyorlandi.
- [x] NDVI, NDWI, NDBI indekslari asosida MVP land-cover klassifikatsiya qilindi.
- [x] Klasslar:
  - Suv
  - Zich vegetatsiya
  - Ekinzor / siyrak vegetatsiya
  - Yalang yer / qurilish
  - Bulut / soya
- [x] 2017-2024 o'zgarish rasteri tayyorlandi.
- [x] Web uchun sifatli JPEG rasterlar yaratildi.
- [x] Ko'rinib turgan no-data joylar visual fill bilan yopildi.
- [x] Raw GeoTIFF backup fayllari D diskdagi ishchi papkada qoldirildi, eksportga qo'shilmadi.

## 3. Web Karta

- [x] Static web app tayyorlandi.
- [x] Leaflet asosida interaktiv karta qurildi.
- [x] 2017, 2020, 2024 yil tugmalari qo'shildi.
- [x] 2017-2024 o'zgarish toggle qatlami qo'shildi.
- [x] Opacity slider qo'shildi.
- [x] Toshkent viloyati chegarasi qo'shildi.
- [x] Toshkent viloyati tuman chegaralari va popup qo'shildi.
- [x] Legend panel qo'shildi.
- [x] Browser cache muammosiga qarshi raster URL version parametri qo'shildi.

## 4. Eksport Tarkibi

Eksport papkasida faqat front uchun kerakli fayllar bor:

- [x] `index.html`
- [x] `css/style.css`
- [x] `js/app.js`
- [x] `assets/lc_2017.jpg`
- [x] `assets/lc_2020.jpg`
- [x] `assets/lc_2024.jpg`
- [x] `assets/change_2017_2024.jpg`
- [x] `data/rasters.json`
- [x] `data/toshkent_viloyat.geojson`
- [x] `data/toshkent_tumanlar.geojson`
- [x] `preview_web_check.png`
- [x] `README_FRONT.md`
- [x] `CHECKLIST_ISHLAR.md`
- [x] `START_SERVER.bat`

Eksportga kiritilmadi:

- [x] Sentinel ZIP/SAFE raw ma'lumotlari
- [x] GeoTIFF ishchi rasterlar
- [x] Copernicus login/parol
- [x] Python virtual environment

## 5. Muhim Eslatma

Bu hozir MVP va vizual namoyish uchun tayyorlangan karta. Klassifikatsiya indekslarga asoslangan. Keyingi ilmiy kuchaytirish uchun training polygon yoki RandomForest/SVM klassifikatsiya qilish tavsiya etiladi.

## 6. Ertangi Front Ishlari Uchun

- [ ] UI ranglarini dissertatsiya uslubiga moslash.
- [ ] O'zbek/kirill yozuvlarni yakuniy standartga keltirish.
- [ ] Mobile holatini tekshirish.
- [ ] GitHub Pages yoki Vercelga deploy qilish.
- [ ] Agar kerak bo'lsa, header/title/dissertatsiya muallifi ma'lumotlarini qo'shish.
