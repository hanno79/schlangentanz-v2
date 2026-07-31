/*
Author: Claude Code (AP-4)
Datum: 30.07.2026
Version: 1.0
Beschreibung: Die beiden Live-Smoke-Ketten als Listen (AP-4, Onboarding-Finding 13).

Vorher standen diese Skripte als rund 8000 Zeichen langer &&-String in package.json.
Als Liste sind sie sowohl fuer den Runner (scripts/run_smokes.mjs) als auch fuer die
Wiring-Tests lesbar, ohne einen Kettenstring zu zerlegen.

- production: laeuft gegen die Production-URL und braucht KEINE Test-Hooks.
- preview:    braucht VITE_TEST_HOOKS=1 und laeuft gegen SMOKE_BASE_URL
              (siehe docs/WORKFLOW.md, Abschnitt "Test-Hooks").

Die Reihenfolge ist bewusst die der bisherigen Kette; mehrere Wiring-Tests pruefen
Positionsvertraege darauf.
*/

export const SMOKE_LISTEN = {
  production: [
    'scripts/live_smoke.mjs',
    'scripts/m1bw_lichtung_entflechtung_smoke.mjs',
    'scripts/m1bx_spielkartenfaecher_smoke.mjs',
    'scripts/m1by_spielbrettweite_smoke.mjs',
    'scripts/m1bz_gegner_hud_smoke.mjs',
    'scripts/m1ca_schlangenlichtung_smoke.mjs',
    'scripts/m1cb_zielranken_smoke.mjs',
    'scripts/m1cc_handsteg_smoke.mjs',
    'scripts/m1cd_startgarten_smoke.mjs',
    'scripts/m1ce_waldstein_spielbrett_smoke.mjs',
    'scripts/m1cf_unterholzleiste_smoke.mjs',
    'scripts/m1cg_zugpfad_waldsteine_smoke.mjs',
    'scripts/m1ci_seitenranke_smoke.mjs',
    'scripts/m1cj_startfaehrten_smoke.mjs',
    'scripts/m1ck_wachstumsfaehrten_smoke.mjs',
    'scripts/m1cl_erstbild_zugknopf_smoke.mjs',
    'scripts/m1cm_zielwahl_faehrten_smoke.mjs',
    'scripts/m1cn_zauberpfad_smoke.mjs',
    'scripts/m1co_zauberpfad_sprung_smoke.mjs',
    'scripts/m1cp_gegner_zauberpfad_sprung_smoke.mjs',
    'scripts/m1cq_gegnerzauberfeld_smoke.mjs',
    'scripts/m1cr_brettschritt_stempel_smoke.mjs',
    'scripts/m1cs_spielbrett_fokus_smoke.mjs',
    'scripts/m1ct_spielkarten_stil_smoke.mjs',
    'scripts/m1cu_brettschritt_lebensader_smoke.mjs',
    'scripts/m1cv_waldtanz_questband_smoke.mjs',
    'scripts/m1cw_brettschritt_konsequenz_smoke.mjs',
    'scripts/m1cx_waldtanz_spielerplakette_smoke.mjs',
    'scripts/m1cy_waldtanz_gegnerplakette_smoke.mjs',
    'scripts/m1cz_waldtanz_gegnerhand_faecher_smoke.mjs',
    'scripts/m1da_waldtanz_handflaeche_erstbild_smoke.mjs',
    'scripts/m1db_waldtanz_spielmoment_smoke.mjs',
    'scripts/m1d0_waldtanz_layout_konsolidierung_smoke.mjs',
    'scripts/m1dc_spielmoment_pulse_smoke.mjs',
    'scripts/m1dd_aktionsdock_im_spielbrett_smoke.mjs',
    'scripts/m1df_waldtanz_steinkreis_smoke.mjs',
    'scripts/m1dg_waldtanz_lichtungsstein_smoke.mjs',
    'scripts/m1d1_arena_flex_column_smoke.mjs',
    'scripts/m1di_waldtanz_schlangenlichtung_smoke.mjs',
    'scripts/m1dj_waldtanz_brettlandschaft_smoke.mjs',
    'scripts/m1dk_waldtanz_phasen_banner_smoke.mjs',
    'scripts/m1f_waldtanz_handbuehne_smoke.mjs',
    'scripts/m1g_waldtanz_spielerplakette_konsolidierung_smoke.mjs',
    'scripts/m1dl_waldtanz_anlegeplatz_dropzone_smoke.mjs',
    'scripts/m1dm_waldtanz_arena_brettrand_smoke.mjs',
    'scripts/m1dn_waldtanz_kompass_flach_smoke.mjs',
    'scripts/m1do_waldtanz_sonnenstand_reduktion_smoke.mjs',
    'scripts/m1ds_waldtanz_spielkarten_hebdichhoch_smoke.mjs',
    'scripts/m1dt_waldtanz_schlangenwurm_smoke.mjs',
    'scripts/m2e_schlangenlichtung_brettwald_befreiung_smoke.mjs',
    'scripts/m2g_brettrand_questpille_smoke.mjs',
    'scripts/m2h_waldtanz_forest_texture_smoke.mjs',
    'scripts/m2i_handkarten_hero_smoke.mjs',
    'scripts/m2r_schlangenlichtung_forest_arena_smoke.mjs',
    'scripts/m2s_leere_schlangenlichtung_ruhig_smoke.mjs',
    'scripts/m2u_hand_drop_glow_smoke.mjs',
    'scripts/m3b_sonniges_nest_spielstart_smoke.mjs',
    'scripts/m5a_sieger_party_stitch_forest_hero_smoke.mjs',
    'scripts/m3c_sonniges_nest_player_cards_smoke.mjs',
    'scripts/m6a_erste_schlange_forest_clearing_smoke.mjs',
    'scripts/m6b_waldtisch_holzwimpel_smoke.mjs',
    'scripts/m7a_waldtanz_spieler_hero_smoke.mjs',
    'scripts/m9_hand_erstbild_smoke.mjs',
    'scripts/m95_arena_cap_smoke.mjs',
    'scripts/m8a_aktions_hinweis_smoke.mjs',
    'scripts/m8b_schlangenfrass_zweiziel_smoke.mjs',
    'scripts/m2w_zugseitenleiste_brettrand_konsolidierung_smoke.mjs',
    'scripts/m2x_brettrand_hand_hero_smoke.mjs',
    'scripts/m2y_gegnerlichtung_leerlauf_smoke.mjs',
    'scripts/m2z_magiekreise_arena_spielobjekte_smoke.mjs',
    'scripts/m3a_brettrand_hand_im_sichtbereich_smoke.mjs',
    'scripts/m3b_handkarten_faecher_stitch_smoke.mjs',
    'scripts/m3d_brettrand_zugleiste_smoke.mjs',
    'scripts/m3e_spielmat_boden_smoke.mjs',
    'scripts/m3f_brettrund_waldobjekte_smoke.mjs',
    'scripts/m3h_stitch_lobby_avatar_smoke.mjs',
    'scripts/m3i_stitch_forest_arena_promotion_smoke.mjs',
  ],
  preview: [
    'scripts/m1e_waldtanz_spieluhr_smoke.mjs',
    'scripts/m1dh_waldtanz_spielhandlung_smoke.mjs',
    'scripts/m1dp_waldtanz_gegnerlichtung_smoke.mjs',
    'scripts/m1dq_waldtanz_sonderkarten_spielmoment_smoke.mjs',
    'scripts/m2a_waldtanz_sonderkarten_brettziel_highlight_smoke.mjs',
    'scripts/m2d_schlangentanz_fixture_helper_smoke.mjs',
  ],
}
