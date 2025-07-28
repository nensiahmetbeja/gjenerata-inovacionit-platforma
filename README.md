# Gjenerata e inovacionit: Platforma kombëtare për idetë rinore

> Një platformë digjitale interaktive që fuqizon të rinjtë për të dorëzuar idetë dhe projektet e tyre për përmirësimin e shërbimeve publike në Shqipëri.

---

## Access instructions

### Përdorues (Qytetarë)
- **Login/Signup URL**: `/auth`
- Mundëson dorëzimin e aplikimeve dhe shikimin e historikut personal

| Email            | Password   |
|------------------|------------|
| `user@test.com`  | `12345678` |

---

### Admin panel

#### Ekzekutiv
- **Login URL**: `/admin`
- Ka akses të plotë mbi të gjitha aplikimet, KPI, statistika dhe menaxhim statusesh/ekspertësh

| Email               | Password   |
|---------------------|------------|
| `ekzekutiv@test.com` | `12345678` |

#### Ekspert
- **Login URL**: `/admin`
- Ka akses vetëm mbi aplikimet që i janë caktuar dhe mund të japë komente dhe sugjerime për ndryshimin e statusit

| Email             | Password   |
|-------------------|------------|
| `ekspert@test.com` | `12345678` |

---

## Teknologjitë kryesore

- Vite + React + TypeScript
- Tailwind CSS + shadcn/ui
- Supabase (Auth, DB, Storage)

---

## Strukturë e platformës

### Përdorues
- Faqe mirëseardhje + hyrje / regjistrim
- Formë interaktive për dorëzim ideje
- Dropdown dinamik për: fusha, bashki, grupmosha
- Ngarkim dokumentesh (DOC, PDF, MOV, etj.)
- Seksion “Aplikimet e Mia” për ndjekje të statusit

### Admin – Ekzekutiv
- Dashboard me KPI: sipas statusit, grupmoshës, fushës, bashkisë
- Tabela dhe karta për menaxhimin e aplikimeve
- Filtrim dhe kërkim i avancuar
- Caktim ekspertësh dhe ndryshim statusesh

### Admin – Ekspert
- Pamje vetëm për aplikimet që i janë caktuar
- Komente të brendshme në aplikim
- Propozim për ndryshim statusi

---

## Struktura e bazës së të dhënave

| Table              | Përshkrim                                                  |
|--------------------|-------------------------------------------------------------|
| `profiles`         | Info përdoruesi + role (`user`, `ekzekutiv`, `ekspert`)     |
| `applications`     | Aplikimet e dorëzuara nga qytetarët                         |
| `status`           | Lista e statuseve me ngjyrat për badge (`color_badge`)      |
| `fusha`            | Fushat e inovacionit (arsimi, turizëm, drejtësi, etj.)      |
| `bashkia`          | Lista e bashkive                                            |
| `application_notes`| Komente dhe sugjerime të brendshme                          |
| `status_history`   | Historia e çdo ndryshimi statusi                            |

### RLS (Row Level Security)
- **Ekzekutiv**: Akses i plotë mbi të gjitha aplikimet
- **Ekspert**: Akses vetëm mbi aplikimet e caktuara (`assigned_ekspert_id`)
- **User**: Akses vetëm mbi aplikimet e veta (`user_id`)

---

## Komponentët kryesorë UI

### Layout dhe Navigim
- `AdminLayout`: Layout i ripërdorshëm për admin panel
- `AdminSidebar`: Sidebar i ripërdorshëm për ekzekutiv dhe ekspert
- `EkzekutivLayout`: Layout specifik për ekzekutiv (dashboard + aplikimet)
- `EkspertLayout`: Layout specifik për ekspert (vetëm aplikimet)
- `UserNavbar`: Navigation bar për përdoruesit

### Aplikime dhe Status
- `ApplicationCardBase`: Kartë bazë për aplikime (e ripërdorshme)
- `ApplicationCardEkzekutiv`: Logjika për kartën e ekzekutivit
- `ApplicationCardEkspert`: Logjika për kartën e ekspertit
- `ApplicationStatusBadge`: Badge dinamik me ngjyrë nga databaza
- `AplikimeTable`: Tabelë për shfaqjen e aplikimeve
- `SubmissionSummary`: Përmbledhje e dorëzimit

### Filtrime
- `FilterDropdown`: Layout i ripërdorshëm për filtrime
- `StatusDropdown`, `FushaDropdown`, `BashkiaDropdown`, `GrupMoshaDropdown`

---

## Instalimi lokalisht

```bash
git clone https://github.com/nensiahmetbeja/gjenerata-inovacionit-platforma.git
cd gjenerata-inovacionit-platforma

npm install
npm run dev
