# Sensoru Pārvaldes Sistēma

React lietotne sensoru datu pārvaldībai ar Supabase backend.

## Uzstādīšana

1. **Instalējiet atkarības:**
```bash
npm install
```

2. **Izveidojiet .env failu:**
```bash
cp .env.example .env
```

3. **Aizpildiet .env ar saviem Supabase kredenciāliem:**
- Atveriet Supabase Dashboard
- Settings → API
- Kopējiet Project URL un anon public key

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

4. **Palaidiet aplikāciju:**
```bash
npm run dev
```

## Funkcionalitāte

- ✅ Lietotāju reģistrācija un autentifikācija (Supabase Auth)
- ✅ Ierīču pievienošana pēc MAC adreses
- ✅ Ierīču pārvaldība (skatīšana, dzēšana)
- ✅ Mērījumu datu skatīšana no Supabase
- ✅ Real-time datu atjaunošana
- ✅ Grafiska datu attēlošana
- ✅ Tumšais/gaišais režīms

## Tehnoloģijas

- React 18
- Vite
- Zustand (state management)
- Supabase (backend + auth)
- Recharts (grafiki)
- React Router

## Supabase Setup

1. Izveidojiet jaunu projektu Supabase
2. Izpildiet SQL skriptu no projekta direktorijas
3. Konfigurējiet RLS politikas
4. Iegūstiet API kredenciālus

## ESP32 Integrācija

MAC adrese no ESP32 tiek izmantota kā device_id.
Dati tiek nosūtīti uz Supabase caur API.
