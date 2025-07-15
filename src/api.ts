const API_BASE_URL = '/api';

function handleForcedLogout() {
  // No need to remove tokens, just reload
  window.location.reload();
}

async function apiFetch(url: string, options: RequestInit = {}) {
  const headers = new Headers(options.headers || {});
  
  if (!headers.has('Content-Type') && options.body) {
      headers.set('Content-Type', 'application/json');
  }

  const fetchOptions: RequestInit = {
    ...options,
    headers,
    credentials: 'include', // This tells the browser to send cookies
  };

  let response = await fetch(`${API_BASE_URL}${url}`, fetchOptions);

  if (response.status === 401) {
    // Try to refresh the token. The refresh endpoint will set a new accessToken cookie.
    const refreshResponse = await fetch(`${API_BASE_URL}/refresh-token`, {
      method: 'POST',
      credentials: 'include', // Also needed for the refresh call
    });

    if (refreshResponse.ok) {
      // If refresh was successful, retry the original request.
      // The browser will automatically send the new accessToken cookie.
      response = await fetch(`${API_BASE_URL}${url}`, fetchOptions);
    } else {
      // If refresh fails, log the user out.
      handleForcedLogout();
      // Return original failed response to stop further processing.
      return response;
    }
  }

  return response;
}

export async function apiUpload(url: string, file: File) {
  const formData = new FormData();
  formData.append('file', file);

  const headers = new Headers();

  const fetchOptions: RequestInit = {
    method: 'POST',
    body: formData,
    headers,
    credentials: 'include',
  };

  let response = await fetch(`${API_BASE_URL}${url}`, fetchOptions);

  if (response.status === 401) {
    const refreshResponse = await fetch(`${API_BASE_URL}/refresh-token`, {
      method: 'POST',
      credentials: 'include',
    });

    if (refreshResponse.ok) {
      response = await fetch(`${API_BASE_URL}${url}`, fetchOptions);
    } else {
      handleForcedLogout();
      return response;
    }
  }
  return response;
}

export default apiFetch; 