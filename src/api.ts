const API_BASE_URL = '';

function handleForcedLogout() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  // Reload the page to reset the application state
  window.location.reload();
}

async function refreshToken() {
  const currentRefreshToken = localStorage.getItem('refreshToken');
  if (!currentRefreshToken) {
    console.log('No refresh token available, forcing logout.');
    // No need to call handleForcedLogout here, as the caller will handle the error
    return null;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/refresh-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken: currentRefreshToken }),
    });

    if (!response.ok) {
      throw new Error('Failed to refresh token');
    }

    const data = await response.json();
    localStorage.setItem('accessToken', data.accessToken);
    return data.accessToken;
  } catch (error) {
    console.error('Could not refresh token:', error);
    // If refreshing fails, the user needs to be logged out.
    handleForcedLogout();
    return null;
  }
}

async function apiFetch(url: string, options: RequestInit = {}) {
  let accessToken = localStorage.getItem('accessToken');

  const headers = new Headers(options.headers || {});
  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }
  if (!headers.has('Content-Type') && options.body) {
      headers.set('Content-Type', 'application/json');
  }

  let response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
  });

  if (response.status === 401 || response.status === 403) {
    const newAccessToken = await refreshToken();
    if (newAccessToken) {
      headers.set('Authorization', `Bearer ${newAccessToken}`);
      // Retry the request with the new token
      response = await fetch(`${API_BASE_URL}${url}`, {
        ...options,
        headers,
      });
    } else {
        // If refresh failed, the refreshToken function already handled the logout.
        // We return the original failed response to prevent the calling code from processing further.
        return response;
    }
  }

  return response;
}

export async function apiUpload(url: string, file: File) {
  const formData = new FormData();
  formData.append('file', file);

  let accessToken = localStorage.getItem('accessToken');
  const headers = new Headers();
  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }

  let response = await fetch(`${API_BASE_URL}${url}`, {
    method: 'POST',
    body: formData,
    headers,
  });

  if (response.status === 401 || response.status === 403) {
    const newAccessToken = await refreshToken();
    if (newAccessToken) {
      headers.set('Authorization', `Bearer ${newAccessToken}`);
      response = await fetch(`${API_BASE_URL}${url}`, {
        method: 'POST',
        body: formData,
        headers,
      });
    } else {
      return response;
    }
  }
  return response;
}

export default apiFetch; 