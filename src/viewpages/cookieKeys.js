// Encrypting key name to base64.
export let emailKey = atob(sessionStorage.getItem(btoa("userEmail")));
