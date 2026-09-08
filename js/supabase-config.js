/* ==========================================================================
   BLUE TOURS ARUGAMBAY - SUPABASE CLIENT CONFIGURATION
   ========================================================================== */

(function () {
  // Configured Supabase Project URL provided by user
  const DEFAULT_SUPABASE_URL = "https://lhcdnllntqcnzlrusmsm.supabase.co";
  const DEFAULT_SUPABASE_KEY = "";

  let supabaseClient = null;

  function getStoredUrl() {
    return (
      (window.SUPABASE_ENV && (window.SUPABASE_ENV.SUPABASE_URL || window.SUPABASE_ENV.NEXT_PUBLIC_SUPABASE_URL)) ||
      localStorage.getItem("BT_SUPABASE_URL") ||
      DEFAULT_SUPABASE_URL
    ).trim();
  }

  function getStoredKey() {
    return (
      (window.SUPABASE_ENV && (window.SUPABASE_ENV.SUPABASE_PUBLISHABLE_KEY || window.SUPABASE_ENV.SUPABASE_ANON_KEY || window.SUPABASE_ENV.NEXT_PUBLIC_SUPABASE_ANON_KEY)) ||
      localStorage.getItem("BT_SUPABASE_PUBLISHABLE_KEY") ||
      localStorage.getItem("BT_SUPABASE_ANON_KEY") ||
      DEFAULT_SUPABASE_KEY
    ).trim();
  }

  function isConfigured() {
    const url = getStoredUrl();
    const key = getStoredKey();
    return Boolean(
      url && 
      url.startsWith("https://") &&
      key &&
      key.length > 20
    );
  }

  function getClient() {
    if (!isConfigured()) {
      return null;
    }

    if (!supabaseClient) {
      if (typeof window.supabase !== "undefined" && window.supabase.createClient) {
        const url = getStoredUrl();
        const key = getStoredKey();
        supabaseClient = window.supabase.createClient(url, key, {
          auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true
          }
        });
      } else {
        console.error("Supabase JS SDK not loaded yet.");
      }
    }
    return supabaseClient;
  }

  // Export to global scope
  window.BlueToursSupabase = {
    getUrl: getStoredUrl,
    getPublishableKey: getStoredKey,
    isConfigured: isConfigured,
    getClient: getClient,
    setCredentials: function (url, key) {
      if (url && key) {
        localStorage.setItem("BT_SUPABASE_URL", url.trim());
        localStorage.setItem("BT_SUPABASE_PUBLISHABLE_KEY", key.trim());
        localStorage.setItem("BT_SUPABASE_ANON_KEY", key.trim());
        supabaseClient = null; // reset cached instance
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
