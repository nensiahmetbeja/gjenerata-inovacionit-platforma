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
| `statuses`         | Lista e statuseve me ngjyrat për badge                      |
| `fields`           | Fushat e inovacionit (arsimi, turizëm, drejtësi, etj.)      |
| `bashkia`          | Lista e bashkive                                            |
| `application_notes`| Komente dhe sugjerime të brendshme                          |
| `status_history`   | Historia e çdo ndryshimi statusi                            |

---

## Komponentët kryesorë UI

- `ApplicationForm`: Formulari kryesor i dorëzimit
- `ApplicationCard`: Kartë për aplikim (variantet për role)
- `ApplicationStatusBadge`: Tregon statusin me ngjyrë përkatëse
- `SidebarLayout`: Layout i ripërdorshëm për ekspert dhe ekzekutiv
- `DashboardKPIs`: Komponent i dashboard-it të ekzekutivit

---

## Instalimi lokalisht (opsional)

```bash
git clone <your_git_url>
cd <your_project_folder>

npm install
npm run dev
