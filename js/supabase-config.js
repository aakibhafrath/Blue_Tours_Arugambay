/* ==========================================================================
   BLUE TOURS ARUGAMBAY - SUPABASE CLIENT CONFIGURATION
   ========================================================================== */

(function () {
  // Configured Supabase Project URL provided by user
  const DEFAULT_SUPABASE_URL = "https://lhcdnllntqcnzlrusmsm.supabase.co";
  
  // Public Publishable / Anon Key placeholder (can be overridden via window.SUPABASE_ENV or localStorage)
  const DEFAULT_SUPABASE_KEY = "";

  // Priority resolution: window.SUPABASE_ENV > localStorage > defaults
  const supabaseUrl = 
    (window.SUPABASE_ENV && (window.SUPABASE_ENV.SUPABASE_URL || window.SUPABASE_ENV.NEXT_PUBLIC_SUPABASE_URL)) ||
    localStorage.getItem("BT_SUPABASE_URL") ||
    DEFAULT_SUPABASE_URL;

  const supabasePublishableKey = 
    (window.SUPABASE_ENV && (window.SUPABASE_ENV.SUPABASE_PUBLISHABLE_KEY || window.SUPABASE_ENV.SUPABASE_ANON_KEY || window.SUPABASE_ENV.NEXT_PUBLIC_SUPABASE_ANON_KEY)) ||
    localStorage.getItem("BT_SUPABASE_PUBLISHABLE_KEY") ||
    localStorage.getItem("BT_SUPABASE_ANON_KEY") ||
    DEFAULT_SUPABASE_KEY;

  let supabaseClient = null;

  function isConfigured() {
    return Boolean(
      supabaseUrl && 
      supabaseUrl.startsWith("https://") &&
      supabasePublishableKey &&
      supabasePublishableKey.length > 20
    );
  }

  function getClient() {
    if (!supabaseClient && isConfigured()) {
      if (typeof window.supabase !== "undefined" && window.supabase.createClient) {
        supabaseClient = window.supabase.createClient(supabaseUrl, supabasePublishableKey, {
          auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true
          }
        });
      }
    }
    return supabaseClient;
  }

  // Export to global scope
  window.BlueToursSupabase = {
    getUrl: () => supabaseUrl,
    getPublishableKey: () => supabasePublishableKey,
    isConfigured: isConfigured,
    getClient: getClient,
    setCredentials: function (url, key) {
      if (url && key) {
        localStorage.setItem("BT_SUPABASE_URL", url.trim());
        localStorage.setItem("BT_SUPABASE_PUBLISHABLE_KEY", key.trim());
        localStorage.setItem("BT_SUPABASE_ANON_KEY", key.trim());
        supabaseClient = null;
      }
    },
    clearCredentials: function () {
      localStorage.removeItem("BT_SUPABASE_URL");
      localStorage.removeItem("BT_SUPABASE_PUBLISHABLE_KEY");
      localStorage.removeItem("BT_SUPABASE_ANON_KEY");
      supabaseClient = null;
    }
  };
})();
