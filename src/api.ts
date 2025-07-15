const API_BASE_URL = '/api';

function handleForcedLogout() {
  // A component should decide when to navigate/reload.
  // This is kept here in case it's used by a direct user action.
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
    credentials: 'include',
  };

  let response = await fetch(`${API_BASE_URL}${url}`, fetchOptions);

  if (response.status === 401) {
    const refreshResponse = await fetch(`${API_BASE_URL}/refresh-token`, {
      method: 'POST',
      credentials: 'include',
    });

    if (refreshResponse.ok) {
      // Retry the original request
      response = await fetch(`${API_BASE_URL}${url}`, fetchOptions);
    } else {
      // If refresh fails, don't trigger a reload loop.
      // Just return the original 401 response. The calling component will handle it.
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
      // Also return the original response here to avoid a loop.
      return response;
    }
  }
  return response;
}

export default apiFetch; 