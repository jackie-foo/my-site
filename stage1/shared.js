"use strict";

window.Stage1Shared = (() => {
  const SUPABASE_URL = "https://djqwztoavtkqspxpvluc.supabase.co";
  const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRqcXd6dG9hdnRrcXNweHB2bHVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIyMDU3MDEsImV4cCI6MjA4Nzc4MTcwMX0.ZVcMU8DeHxHMw3WWegz88BmCei9z4UX3tZR7n1XFRj0";
  const BASE_PATH = "/stage1";

  const PERSONA_MAP = {
    clarifier: "Clarifier",
    optimizer: "Optimizer",
    validator: "Validator",
    overwhelmed: "Overwhelmed",
    independent: "Independent",
    storybuilder: "Story Builder",
    perfectionist: "Perfectionist",
    strategist: "Strategist",
    scale_thinkers: "Scale Thinkers",
    workflow_organisers: "Workflow Organisers",
    time_bound_markers: "Time-Bound Markers",
    student_sense_makers: "Student Sense-Makers",
    consistency_builders: "Consistency Builders",
    boundary_keepers: "Boundary Keepers"
  };

  function getKeys(room){
    return {
      PID_KEY: "stage1_participant_id",
      AUTH_KEY: `stage1_authed_${room}`,
      TUT_KEY: `stage1_tut_seen_${room}`,
      NAME_KEY: `stage1_name_${room}`,
      ROLE_KEY: `stage1_role_${room}`,
      PERSONA_KEY: `stage1_persona_${room}`,
      STEP3_KEY: `stage1_step3_authed_${room}`,
      STEP2_TUT_KEY: `stage1_step2_tut_seen_${room}`,
      STEP3_TUT_KEY: `stage1_step3_tut_seen_${room}`
    };
  }

  function escapeHtml(str){
    return (str ?? "")
      .replaceAll("&","&amp;")
      .replaceAll("<","&lt;")
      .replaceAll(">","&gt;")
      .replaceAll('"',"&quot;")
      .replaceAll("'","&#039;");
  }

  function cleanDisplayName(raw){
    const name = (raw || "").trim().replace(/\s+/g, " ");
    if (!name) return null;
    if (name.length < 2) return null;
    if (name.length > 32) return name.slice(0, 32);
    return name;
  }

  function getOrCreateParticipantId(storageKey){
    const key = storageKey || "stage1_participant_id";
    let participantId = localStorage.getItem(key);
    if (!participantId){
      participantId = crypto.randomUUID();
      localStorage.setItem(key, participantId);
    }
    return participantId;
  }

  function personaTitle(id){
    return PERSONA_MAP[id] || "None";
  }

  async function hydrateIdentity({ supabase, participantId, keys }){
    const localIdentity = {
      displayName: cleanDisplayName(localStorage.getItem(keys.NAME_KEY)),
      role: localStorage.getItem(keys.ROLE_KEY) === "tutor" ? "tutor" : "student",
      personaId: localStorage.getItem(keys.PERSONA_KEY) || null
    };
    try{
      const { data, error } = await supabase
        .from("workshop_participants")
        .select("display_name, role, persona_id")
        .eq("id", participantId)
        .maybeSingle();
      if (error) throw error;
      if (!data) return localIdentity;

      const displayName = cleanDisplayName(data.display_name);
      const role = data.role === "tutor" ? "tutor" : "student";
      const personaId = data.persona_id || null;

      if (displayName) localStorage.setItem(keys.NAME_KEY, displayName);
      localStorage.setItem(keys.ROLE_KEY, role);
      if (personaId) localStorage.setItem(keys.PERSONA_KEY, personaId);

      return { displayName, role, personaId };
    } catch (err){
      console.error("identity hydration error", err);
      return localIdentity;
    }
  }

  return {
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
    BASE_PATH,
    PERSONA_MAP,
    getKeys,
    escapeHtml,
    cleanDisplayName,
    getOrCreateParticipantId,
    personaTitle,
    hydrateIdentity
  };
})();
