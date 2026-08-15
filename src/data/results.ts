/**
 * Výsledkové listiny domácích akcí — archiv přenesený ze starého webu.
 * Soubory (.xlsx / .xls / .pdf) leží v public/soubory/vysledky/, web už tedy
 * nezávisí na původním serveru.
 */

export type ResultKind =
  | 'hry'
  | 'zavody'
  | 'drezura'
  | 'trenink'
  | 'sampionat'
  | 'kmk'
  | 'mikulas';

export interface ResultEntry {
  /** ISO datum konání */
  date: string;
  title: string;
  /** Cesta k souboru s výsledky (relativně ke kořeni webu) */
  file?: string;
}

export const resultKindLabels: Record<ResultKind, string> = {
  hry: 'Jezdecké hry',
  zavody: 'Závody',
  drezura: 'Drezura',
  trenink: 'Veřejný trénink',
  sampionat: 'Dětský šampionát',
  kmk: 'Kritéria mladých koní',
  mikulas: 'Mikulášská veselice',
};

/** Archiv ze starého webu kategorii neukládal — odvodíme ji z názvu. */
export function resultKind(title: string): ResultKind {
  const t = title.toUpperCase();
  if (t.includes('MIKUL')) return 'mikulas';
  if (t.includes('ŠAMPIONÁT')) return 'sampionat';
  if (t.includes('KMK') || t.includes('KRITÉRIA')) return 'kmk';
  if (t.includes('HRY')) return 'hry';
  if (t.includes('DREZUR')) return 'drezura';
  if (t.includes('TRÉNINK')) return 'trenink';
  return 'zavody';
}

export function resultYear(date: string): number {
  return Number(date.slice(0, 4));
}

export const results: ResultEntry[] = [
  { date: '2026-05-17', title: 'JEZDECKÉ HRY PRO DĚTI', file: '/soubory/vysledky/2026-05-17-JH_17.5.26_-_v_sledky.xlsx' },
  { date: '2026-03-29', title: 'JEZDECKÉ HRY PRO DĚTI', file: '/soubory/vysledky/2026-03-29-Jezdeck__hry._29.3.2026.xlsx' },
  { date: '2025-09-21', title: 'JEZDECKÉ HRY - FINÁLE', file: '/soubory/vysledky/2025-09-21-Z____21.09.2025_JEZDECK__HRY.xlsx' },
  { date: '2025-06-15', title: 'JEZDECKÉ HRY PRO DĚTI', file: '/soubory/vysledky/2025-06-15-Jezdeck__hry_15.6.25_-_v_sledky.xlsx' },
  { date: '2025-05-17', title: 'JEZDECKÉ HRY PRO DĚTI', file: '/soubory/vysledky/2025-05-17-Jezdeck__hry_17.5.25.xlsx' },
  { date: '2025-04-06', title: 'JEZDECKÉ HRY PRO DĚTI', file: '/soubory/vysledky/2025-04-06-Jezdeck__hry_6.4.2025.xlsx' },
  { date: '2024-12-01', title: 'MIKULÁŠSKÁ VESELICE', file: '/soubory/vysledky/2024-12-01-Mikul__sk__veselice_1.12.2024_-_v_sledky.xlsx' },
  { date: '2024-09-29', title: 'JEZDECKÉ HRY PRO DĚTI - FINÁLE', file: '/soubory/vysledky/2024-09-29-Jezdeck__hry_29.9.2024_-_v_sledky.xlsx' },
  { date: '2024-06-23', title: 'JEZDECKÉ HRY PRO DĚTI', file: '/soubory/vysledky/2024-06-23-Jezdeck__hry_23.6.2024_-_v_sledky.xlsx' },
  { date: '2024-05-26', title: 'JEZDECKÉ HRY PRO DĚTI', file: '/soubory/vysledky/2024-05-26-Jezdeck__hry_26.5.2024_-_v_sledky.xlsx' },
  { date: '2024-04-28', title: 'JEZDECKÉ HRY PRO DĚTI', file: '/soubory/vysledky/2024-04-28-Jezdeck__hry_28.4.2024_-_v_sledky.xlsx' },
  { date: '2023-12-03', title: 'MIKULÁŠSKÁ VESELICE', file: '/soubory/vysledky/2023-12-03-Mikul__sk__veselice_3.12.2023_-_v_sledky.xlsx' },
  { date: '2023-10-22', title: 'JEZDECKÉ HRY PRO DĚTI - FINÁLE', file: '/soubory/vysledky/2023-10-22-Jezdeck__hry_22.10.2023_-_v_sledky.xlsx' },
  { date: '2023-06-11', title: 'JEZDECKÉ HRY PRO DĚTI', file: '/soubory/vysledky/2023-06-11-Jezdeck__hry_11.6.2023_-_v_sledky.xlsx' },
  { date: '2023-05-14', title: 'JEZDECKÉ HRY PRO DĚTI', file: '/soubory/vysledky/2023-05-14-Jezdeck__hry_14.5.2023_-_v_sledky.xlsx' },
  { date: '2023-04-23', title: 'JEZDECKÉ HRY PRO DĚTI', file: '/soubory/vysledky/2023-04-23-Mikul__sk__veselice_3.12.2022_v_sledky.xlsx' },
  { date: '2022-12-03', title: 'MIKULÁŠSKÁ VESELICE', file: '/soubory/vysledky/2022-12-03-Mikul__sk__veselice_3.12.2022_v_sledky.xlsx' },
  { date: '2022-10-08', title: 'DĚTSKÝ ŠAMPIONÁT 2022', file: '/soubory/vysledky/2022-10-08-D_tsk____ampion_t_8.10.2022_-_v_sledky.xlsx' },
  { date: '2022-09-18', title: 'JEZDECKÉ HRY - FINÁLE', file: '/soubory/vysledky/2022-09-18-Jezdeck__hry_18.9.2022_-_v_sledky.xlsx' },
  { date: '2022-06-04', title: 'JEZDECKÉ HRY PRO DĚTI', file: '/soubory/vysledky/2022-06-04-Jezdeck__hry_4.6.2022_-_v_sledky.xlsx' },
  { date: '2022-05-15', title: 'JEZDECKÉ HRY PRO DĚTI', file: '/soubory/vysledky/2022-05-15-Jezdeck__hry_15.5.2022_-_v_sl..xlsx' },
  { date: '2022-04-24', title: 'JEZDECKÉ HRY PRO DĚTI', file: '/soubory/vysledky/2022-04-24-Jezdeck__hry_24.4.2022_-_v_sledky.xlsx' },
  { date: '2021-12-05', title: 'MIKULÁŠSKÁ VESELICE', file: '/soubory/vysledky/2021-12-05-Mikul__sk__veselice_5.12.2021.xlsx' },
  { date: '2021-10-19', title: 'DĚTSKÝ ŠAMPIONÁT 2021', file: '/soubory/vysledky/2021-10-19-D_tsk____ampion_t_10.10.2021_-_v_sledky.xlsx' },
  { date: '2021-09-25', title: 'JEZDECKÉ HRY PRO DĚTI - FINÁLE', file: '/soubory/vysledky/2021-09-25-Jezdeck__hry_25.9.2021_-_v_sledky.xlsx' },
  { date: '2021-06-12', title: 'JEZDECKÉ HRY PRO DĚTI', file: '/soubory/vysledky/2021-06-12-Jezdeck__hry_12.6.2021_-_v_sledky.xlsx' },
  { date: '2021-05-23', title: 'JEZDECKÉ HRY PRO DĚTI', file: '/soubory/vysledky/2021-05-23-Jezdeck__hry_23.5.2021_-_v_sledky.xlsx' },
  { date: '2020-12-05', title: 'MIKULÁŠSKÁ VESELICE', file: '/soubory/vysledky/2020-12-05-Mikul__sk__veselice_5.12.2020.xlsx' },
  { date: '2020-10-11', title: 'DĚTSKÝ ŠAMPIONÁT', file: '/soubory/vysledky/2020-10-11-D_tsk____ampion_t_11.10.2020_-_v_sledky.xlsx' },
  { date: '2020-09-26', title: 'JEZDECKÉ HRY PRO DĚTI - FINÁLE', file: '/soubory/vysledky/2020-09-26-Jezdeck__hry_26.9.2020___v_sledky.xlsx' },
  { date: '2020-06-13', title: 'JEZDECKÉ HRY PRO DĚTI', file: '/soubory/vysledky/2020-06-13-362-Jezdeck__hry_13.6.2020_oprava.xlsx' },
  { date: '2020-05-16', title: 'JEZDECKÉ HRY PRO DĚTI', file: '/soubory/vysledky/2020-05-16-Jezdeck__hry_16.5.2020.xlsx' },
  { date: '2019-11-30', title: 'MIKULÁŠSKÁ VESELICE', file: '/soubory/vysledky/2019-11-30-Mikul__sk__veselice_30.11.2019_-_v_sledky.xlsx' },
  { date: '2019-10-05', title: 'DĚTSKÝ ŠAMPIONÁT 2019', file: '/soubory/vysledky/2019-10-05-D_tsk____ampion_t_5.10.2019.xlsx' },
  { date: '2019-09-21', title: 'JEZDECKÉ HRY PRO DĚTI - FINÁLE', file: '/soubory/vysledky/2019-09-21-Jezdeck__hry_21.9.2019_-_V_SLEDKY.xlsx' },
  { date: '2019-06-15', title: 'JEZDECKÉ HRY - ČERVEN', file: '/soubory/vysledky/2019-06-15-Jezdeck__hry_15.6.2019_-_v_sledky.xlsx' },
  { date: '2019-05-25', title: 'JEZDECKÉ HRY PRO DĚTI', file: '/soubory/vysledky/2019-05-25-Jezdeck__hry_25.5.2019_-_v_sledky.xlsx' },
  { date: '2019-04-28', title: 'JEZDECKÉ HRY PRO DĚTI', file: '/soubory/vysledky/2019-04-28-Jezdeck__hry_28.4.2019_-_v_sledky.xlsx' },
  { date: '2018-12-01', title: 'MIKULÁŠSKÁ VESELICE', file: '/soubory/vysledky/2018-12-01-Mikul__sk__rej_1.12.2018.xlsx' },
  { date: '2018-10-06', title: 'JEZDECKÉ HRY - FINÁLE', file: '/soubory/vysledky/2018-10-06-Jezdeck__hry_6.10.2018.xlsx' },
  { date: '2018-09-29', title: 'DĚTSKÝ ŠAMPIONÁT 2018', file: '/soubory/vysledky/2018-09-29-D_tsk____ampion_t_29.9.2018.xlsx' },
  { date: '2018-06-16', title: 'JEZDECKÉ HRY PRO DĚTI', file: '/soubory/vysledky/2018-06-16-Jezdeck__hry_16.6.2018_-_V_SLEDKY.xlsx' },
  { date: '2018-05-20', title: 'JEZDECKÉ HRY PRO DĚTI', file: '/soubory/vysledky/2018-05-20-Jezdeck__hry_20.5.2018.xlsx' },
  { date: '2018-04-21', title: 'JEZDECKÉ HRY PRO DĚTI', file: '/soubory/vysledky/2018-04-21-Jezdeck__hry_21.4.2018__2_.xlsx' },
  { date: '2017-12-02', title: 'MIKULÁŠSKÁ VESELICE', file: '/soubory/vysledky/2017-12-02-Mikul__sk__rej_2.12.2017.xlsx' },
  { date: '2017-10-07', title: 'DĚTSKÝ ŠAMPIONÁT 2017', file: '/soubory/vysledky/2017-10-07-D_tsk____ampion_t_7.10.2017.xlsx' },
  { date: '2017-06-17', title: 'JEZDECKÉ HRY PRO DĚTI', file: '/soubory/vysledky/2017-06-17-Jezdeck__hry_17.6.2017.xlsx' },
  { date: '2017-05-14', title: 'JEZDECKÉ HRY PRO DĚTI', file: '/soubory/vysledky/2017-05-14-Jezdeck__hry_14.5.2017.xlsx' },
  { date: '2017-04-22', title: 'JEZDECKÉ HRY PRO DĚTI', file: '/soubory/vysledky/2017-04-22-Jezdeck__hry_22.4.2017.xlsx' },
  { date: '2016-12-03', title: 'MIKULÁŠSKÁ VESELICE', file: '/soubory/vysledky/2016-12-03-Mikul__sk__rej_3.12.2016-v_sledky.xlsx' },
  { date: '2016-10-08', title: 'DĚTSKÝ ŠAMPIONÁT 2016', file: '/soubory/vysledky/2016-10-08-D_tsk____ampion_t_8.10.2016__2_.xlsx' },
  { date: '2016-09-18', title: 'JEZDECKÉ HRY PRO DĚTI - FINÁLE', file: '/soubory/vysledky/2016-09-18-Jezdeck__hry_18.9.2016.xlsx' },
  { date: '2016-06-18', title: 'JEZDECKÉ HRY PRO DĚTI', file: '/soubory/vysledky/2016-06-18-Jezdeck__hry_18.6.2016.xlsx' },
  { date: '2016-05-28', title: 'DREZURNÍ ZÁVODY', file: '/soubory/vysledky/2016-05-28-Z1.pdf' },
  { date: '2016-05-14', title: 'JEZDECKÉ HRY PRO DĚTI', file: '/soubory/vysledky/2016-05-14-Jezdeck__hry_14.5.2016.xlsx' },
  { date: '2016-04-23', title: 'JEZDECKÉ HRY PRO DĚTI', file: '/soubory/vysledky/2016-04-23-Jezdeck__hry_23.4.2016.xlsx' },
  { date: '2015-10-10', title: 'DĚTSKÝ ŠAMPIONÁT 2015', file: '/soubory/vysledky/2015-10-10-D_tsk____ampion_t_10.10.2015.xlsx' },
  { date: '2015-09-12', title: 'JEZDECKÉ HRY PRO DĚTI', file: '/soubory/vysledky/2015-09-12-Jezdeck__hry_12.9.2015__2_.xlsx' },
  { date: '2015-06-13', title: 'JEZDECKÉ HRY PRO DĚTI', file: '/soubory/vysledky/2015-06-13-Jezdeck__hry_13.6.2015.xlsx' },
  { date: '2015-05-30', title: 'DREZURNÍ ZÁVODY', file: '/soubory/vysledky/2015-05-30-Dr_z_vody_v_sledky_30.5.2015.xlsx' },
  { date: '2015-05-16', title: 'JEZDECKÉ HRY PRO DĚTI', file: '/soubory/vysledky/2015-05-16-Jezdeck__hry_16.5.2015.xlsx' },
  { date: '2015-05-09', title: 'KVĚTNOVÉ JEZDECKÉ ZÁVODY', file: '/soubory/vysledky/2015-05-09-1-Sucha2015-5-ZZ-Hobby.pdf' },
  { date: '2015-04-25', title: 'DUBNOVÉ JEZDECKÉ ZÁVODY', file: '/soubory/vysledky/2015-04-25-1-ZZ-vysl.pdf' },
  { date: '2015-04-18', title: 'JEZDECKÉ HRY PRO DĚTI', file: '/soubory/vysledky/2015-04-18-Jezdeck__hry_18.4.2015___v_sledky.xlsx' },
  { date: '2015-04-11', title: 'VEŘEJNÝ TRÉNINK A HOBBY SOUTĚŽE', file: '/soubory/vysledky/2015-04-11-VT_11.04.2015.xlsx' },
  { date: '2015-03-28', title: 'VEŘEJNÝ TRÉNINK A HOBBY SOUTĚŽE', file: '/soubory/vysledky/2015-03-28-VT_28.03.2015.xlsx' },
  { date: '2015-03-15', title: 'VEŘEJNÝ TRÉNINK A HOBBY SOUTĚŽE', file: '/soubory/vysledky/2015-03-15-VT_15.03.2015.xlsx' },
  { date: '2015-02-28', title: 'VEŘEJNÝ TRÉNINK A HOBBY SOUTĚŽE', file: '/soubory/vysledky/2015-02-28-VT_28.02.2015.xlsx' },
  { date: '2015-02-14', title: 'VEŘEJNÝ TRÉNINK A HOBBY SOUTĚŽE', file: '/soubory/vysledky/2015-02-14-VT_06.12.2014.xlsx' },
  { date: '2014-12-06', title: 'VEŘEJNÝ TRÉNINK A HOBBY SOUTĚŽE', file: '/soubory/vysledky/2014-12-06-VT_06.12.2014.xlsx' },
  { date: '2014-11-22', title: 'VEŘEJNÝ TRÉNINK A HOBBY SOUTĚŽE', file: '/soubory/vysledky/2014-11-22-VT_22.11.2014.xlsx' },
  { date: '2014-11-15', title: 'DREZURNÍ VEŘEJNÝ TRÉNINK', file: '/soubory/vysledky/2014-11-15-DVTRE_15.11.2014.xlsx' },
  { date: '2014-11-08', title: 'VEŘEJNÝ TRÉNINK A HOBBY SOUTĚŽE', file: '/soubory/vysledky/2014-11-08-VT_08.11.2014.xlsx' },
  { date: '2014-10-25', title: 'VEŘEJNÝ TRÉNINK A HOBBY SOUTĚŽE', file: '/soubory/vysledky/2014-10-25-VT_25.10.2014.xlsx' },
  { date: '2014-10-18', title: 'DREZURNÍ VEŘEJNÝ TRÉNINK', file: '/soubory/vysledky/2014-10-18-DVTRE_18.10.2014.xlsx' },
  { date: '2014-10-11', title: 'DĚTSKÝ ŠAMPIONÁT 2014', file: '/soubory/vysledky/2014-10-11-D_tsk____ampion_t_11.10.2014.xlsx' },
  { date: '2014-10-04', title: 'PODZIMNÍ JEZDECKÉ ZÁVODY', file: '/soubory/vysledky/2014-10-04-1-Sucha10-ZM.pdf' },
  { date: '2014-09-28', title: 'DREZURNÍ VEŘEJNÝ TRÉNINK', file: '/soubory/vysledky/2014-09-28-DVTRE_28.9.2014.xlsx' },
  { date: '2014-09-20', title: 'VEŘEJNÝ TRÉNINK A HOBBY SOUTĚŽE' },
  { date: '2014-09-13', title: 'JEZDECKÉ HRY PRO DĚTI', file: '/soubory/vysledky/2014-09-13-Jezdeck__hry_13.9.2014.xlsx' },
  { date: '2014-08-26', title: 'KMK', file: '/soubory/vysledky/2014-08-26-1-4lete_K.pdf' },
  { date: '2014-08-23', title: 'SRPNOVÉ JEZDECKÉ ZÁVODY', file: '/soubory/vysledky/2014-08-23-soutez01.pdf' },
  { date: '2014-07-19', title: 'ČERVENCOVÉ JEZDECKÉ ZÁVODY', file: '/soubory/vysledky/2014-07-19-soutez01.pdf' },
  { date: '2014-06-14', title: 'JEZDECKÉ HRY PRO DĚTI', file: '/soubory/vysledky/2014-06-14-280-Jezdeck__hry_14.6.2014.xlsx' },
  { date: '2014-06-01', title: 'DREZURNÍ ZÁVODY', file: '/soubory/vysledky/2014-06-01-v_sledky_Z1.pdf' },
  { date: '2014-05-10', title: 'KVĚTNOVÉ JEZDECKÉ ZÁVODY', file: '/soubory/vysledky/2014-05-10-vysledky01.pdf' },
  { date: '2014-05-08', title: 'VEŘEJNÝ TRÉNINK A HOBBY SOUTĚŽE', file: '/soubory/vysledky/2014-05-08-VT_08.05.2014.xlsx' },
  { date: '2014-05-01', title: 'KMK', file: '/soubory/vysledky/2014-05-01-1KMK-Sucha2014-Z1-vysl.pdf' },
  { date: '2014-04-19', title: 'DUBNOVÉ JEZDECKÉ ZÁVODY', file: '/soubory/vysledky/2014-04-19-V_sledky_hobby_parkur_do_80_cm_na_L_.pdf' },
  { date: '2014-04-12', title: 'VEŘEJNÝ TRÉNINK A HOBBY SOUTĚŽE', file: '/soubory/vysledky/2014-04-12-VT_12.04.2014.xlsx' },
  { date: '2014-04-05', title: 'JEZDECKÉ HRY PRO DĚTI', file: '/soubory/vysledky/2014-04-05-Jezdeck__hry_5.4..2014.xls' },
  { date: '2014-03-29', title: 'VEŘEJNÝ TRÉNINK A HOBBY SOUTĚŽE', file: '/soubory/vysledky/2014-03-29-VT_29.03.2014.xlsx' },
  { date: '2014-03-22', title: 'DREZURNÍ VEŘEJNÝ TRÉNINK', file: '/soubory/vysledky/2014-03-22-DVTRE_22.3.2014.xlsx' },
  { date: '2013-11-30', title: 'MIKULÁŠSKÁ REJ', file: '/soubory/vysledky/2013-11-30-Mikul__sk__rej_30.11.2013__2_.xlsx' },
  { date: '2013-11-23', title: 'VEŘEJNÝ TRÉNINK A HOBBY SOUTĚŽE', file: '/soubory/vysledky/2013-11-23-VT_23.11.2013.xlsx' },
  { date: '2013-11-16', title: 'DREZURNÍ VEŘEJNÝ TRÉNINK', file: '/soubory/vysledky/2013-11-16-DVTRE_16.11.2013.xlsx' },
  { date: '2013-11-09', title: 'VEŘEJNÝ TRÉNINK A HOBBY SOUTĚŽE', file: '/soubory/vysledky/2013-11-09-VT_09.11.2013.xlsx' },
  { date: '2013-10-26', title: 'VEŘEJNÝ TRÉNINK A HOBBY SOUTĚŽE', file: '/soubory/vysledky/2013-10-26-VT_26.10.2013.xlsx' },
  { date: '2013-10-19', title: 'DREZURNÍ VEŘEJNÝ TRÉNINK', file: '/soubory/vysledky/2013-10-19-DVTRE_19.10.2013.xlsx' },
  { date: '2013-10-12', title: 'DĚTSKÝ ŠAMPIONÁT 2013', file: '/soubory/vysledky/2013-10-12-D_tsk____ampion_t_12.10.2013.xls' },
  { date: '2013-10-05', title: 'PODZIMNÍ ZÁVODY', file: '/soubory/vysledky/2013-10-05-Sucha-5-10-2013-ZM.pdf' },
  { date: '2013-09-28', title: 'VEŘEJNÝ TRÉNINK A HOBBY SOUTĚŽE', file: '/soubory/vysledky/2013-09-28-VT_28.9.2013.xlsx' },
  { date: '2013-08-24', title: 'SRPNOVÉ JEZDECKÉ ZÁVODY', file: '/soubory/vysledky/2013-08-24-soutez01.pdf' },
  { date: '2013-07-13', title: 'JEZDECKÉ ZÁVODY + MISTR. VCO DĚTÍ, J a Y', file: '/soubory/vysledky/2013-07-13-Sucha-13-7-2013-Z.pdf' },
  { date: '2013-06-22', title: 'JEZDECKÉ HRY PRO DĚTI', file: '/soubory/vysledky/2013-06-22-Jezdeck__hry_22._6.2013.xls' },
  { date: '2013-05-25', title: 'DREZURNÍ VEŘEJNÝ TRÉNINK', file: '/soubory/vysledky/2013-05-25-DVTRE_25.5._2013.xls' },
  { date: '2013-05-18', title: 'KVĚTNOVÉ JEZDECKÉ HRY', file: '/soubory/vysledky/2013-05-18-Jezdeck__hry_18.5.2013.xls' },
  { date: '2013-05-11', title: 'KVĚTNOVÉ JEZDECKÉ ZÁVODY', file: '/soubory/vysledky/2013-05-11-Vysl-Sucha5-hobby.pdf' },
  { date: '2013-05-08', title: 'VEŘEJNÝ TRÉNINK, HOBBY SOUTĚŽE', file: '/soubory/vysledky/2013-05-08-VT_8.5.2013.xls' },
  { date: '2013-04-28', title: 'DREZURNÍ VEŘEJNÝ TRÉNINK', file: '/soubory/vysledky/2013-04-28-DVTRE_28.4._2013.xls' },
  { date: '2013-04-27', title: 'DUBNOVÉ JEZDECKÉ ZÁVODY', file: '/soubory/vysledky/2013-04-27-V_sledky_-_Hobby_ZZ.pdf' },
  { date: '2013-04-20', title: 'VEŘEJNÝ TRÉNINK', file: '/soubory/vysledky/2013-04-20-VT_20.4.2013.xlsx' },
  { date: '2013-04-13', title: 'JEZDECKÉ HRY PRO DĚTI', file: '/soubory/vysledky/2013-04-13-Jezdeck__hry_13._dubna_2013.xls' },
  { date: '2013-03-17', title: 'VEŘEJNÝ TRÉNINK', file: '/soubory/vysledky/2013-03-17-VT_17.3.2013_kopie.xls' },
  { date: '2013-03-02', title: 'VEŘEJNÝ TRÉNINK', file: '/soubory/vysledky/2013-03-02-VT2.3..xlsx' },
  { date: '2012-12-08', title: 'VEŘEJNÝ TRÉNINK', file: '/soubory/vysledky/2012-12-08-VT__8.12.2012_.xls' },
  { date: '2012-12-01', title: 'MIKULÁŠSKÁ VESELICE', file: '/soubory/vysledky/2012-12-01-Jezdeck__hry_1.12.2012.xls' },
  { date: '2012-11-17', title: 'DREZURNÍ VEŘEJNÝ TRÉNINK', file: '/soubory/vysledky/2012-11-17-DVT_17.11.2012.xls' },
  { date: '2012-11-10', title: 'VEŘEJNÝ TRÉNINK', file: '/soubory/vysledky/2012-11-10-VT__10.11.2012.xls' },
  { date: '2012-10-27', title: 'VEŘEJNÝ TRÉNINK', file: '/soubory/vysledky/2012-10-27-VTRE_27.10.2012.xls' },
  { date: '2012-10-20', title: 'DREZURNÍ VEŘEJNÝ TRÉNINK', file: '/soubory/vysledky/2012-10-20-DVT_20.10.2012.xls' },
  { date: '2012-10-13', title: 'DĚTSKÝ ŠAMPIONÁT 2012', file: '/soubory/vysledky/2012-10-13-Jezdeck__hry_13.10.2012.xls' },
  { date: '2012-10-06', title: 'PODZIMNÍ JEZDECKÉ ZÁVODY', file: '/soubory/vysledky/2012-10-06-V_sledky_postupn__obt__nost_do_100_cm.pdf' },
  { date: '2012-09-29', title: 'VEŘEJNÝ TRÉNINK, HOBBY SOUTĚŽE', file: '/soubory/vysledky/2012-09-29-VT_29.9.2012.xls' },
  { date: '2012-09-23', title: 'DREZURNÍ VEŘEJNÝ TRÉNINK', file: '/soubory/vysledky/2012-09-23-DVT_23.9.2012.xls' },
  { date: '2012-09-15', title: 'JEZDECKÉ HRY PRO DĚTI', file: '/soubory/vysledky/2012-09-15-Jezdeck__hry_15.z____2012.xls' },
  { date: '2012-08-08', title: 'KRITÉRIA MLADÝCH KONÍ', file: '/soubory/vysledky/2012-08-08-V_sledky_parkur_ZL_-_KMK_4-let__klisny.pdf' },
  { date: '2012-06-23', title: 'JEZDECKÉ HRY PRO DĚTI', file: '/soubory/vysledky/2012-06-23-hry_24.6.2012.xls' },
  { date: '2012-06-03', title: 'DREZURNÍ JEZDECKÉ ZÁVODY', file: '/soubory/vysledky/2012-06-03-Drez-Sucha-P4.pdf' },
  { date: '2012-05-26', title: 'DREZURNÍ VEŘEJNÝ TRÉNINK', file: '/soubory/vysledky/2012-05-26-DVT_Such__26.5.2012.xls' },
  { date: '2012-05-22', title: 'KRITÉRIA MLADÝCH KONÍ', file: '/soubory/vysledky/2012-05-22-Vysledky_parkur_Z_-_KMK_pro_4-lete_klisny.pdf' },
  { date: '2012-05-19', title: 'JEZDECKÉ HRY PRO DĚTI', file: '/soubory/vysledky/2012-05-19-Jezdeck__hry_19.5.2012.xls' },
  { date: '2012-05-12', title: 'JARNÍ JEZDECKÉ ZÁVODY', file: '/soubory/vysledky/2012-05-12-Sucha_kveten2011_ZM.pdf' },
  { date: '2012-05-08', title: 'VEŘEJNÝ TRÉNINK , HOBBY SOUTĚŽE 8.5.2012', file: '/soubory/vysledky/2012-05-08-VT_Such__8.5.2012.xls' },
  { date: '2012-04-29', title: 'DREZURNÍ VEŘEJNÝ TRÉNINK', file: '/soubory/vysledky/2012-04-29-DVT_Such__29.4.2012.xls' },
  { date: '2012-04-28', title: 'JEZDECKÉ ZÁVODY', file: '/soubory/vysledky/2012-04-28-V_sledky_hobby_sout__-postupn__obt__nost_do_80_cm.pdf' },
  { date: '2012-04-21', title: 'VEŘEJNÝ TRÉNINK', file: '/soubory/vysledky/2012-04-21-VT__Such__21.4.2012a.xls' },
  { date: '2012-04-14', title: 'JEZDECKÉ HRY PRO DĚTI', file: '/soubory/vysledky/2012-04-14-Jezdeck__hry_14.4.2012.xls' },
  { date: '2012-04-07', title: 'DREZURNÍ VEŘEJNÝ TRÉNINK', file: '/soubory/vysledky/2012-04-07-DVT_Such__7.4.2012.xls' },
  { date: '2012-03-31', title: 'VEŘEJNÝ TRÉNINK A HOBBY SOUTĚŽE', file: '/soubory/vysledky/2012-03-31-VT_Such__31.3.2012.xls' },
  { date: '2012-03-24', title: 'DREZURNÍ VEŘEJNÝ TRÉNINK', file: '/soubory/vysledky/2012-03-24-DVT_Such__24.3.2012.xls' },
  { date: '2012-03-17', title: 'VEŘEJNÝ TRÉNINK', file: '/soubory/vysledky/2012-03-17-VT_Sucha_17.3.2012.xlsx' },
  { date: '2012-03-03', title: 'VEŘEJNÝ TRÉNINK', file: '/soubory/vysledky/2012-03-03-VT_Such__18.2.2012_.xls' },
  { date: '2012-02-18', title: 'VEŘEJNÝ TRÉNINK', file: '/soubory/vysledky/2012-02-18-VT_Such__18.2.2012_.xls' },
  { date: '2012-01-21', title: 'VEŘEJNÝ TRÉNINK', file: '/soubory/vysledky/2012-01-21-VT_Such__21.1.2012.xls' },
  { date: '2012-01-07', title: 'VEŘEJNÝ TRÉNINK', file: '/soubory/vysledky/2012-01-07-VT_Such__7.1.2012.xls' },
];

/** Roky, ve kterých existují výsledky — pro filtr na stránce. */
export const resultYears: number[] = [
  ...new Set(results.map((r) => resultYear(r.date))),
].sort((a, b) => b - a);
