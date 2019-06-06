function clearError() {
    document.getElementById('error').innerText = '';
    document.getElementById('error').hidden = true;
}

function requireLogin() {
    let jwt = localStorage.getItem('jwt');
    let expired = false;
    if (jwt) {
        data = parseJwt(jwt);
        expired = Date.now() / 1000 > data.exp;
    }
    // TODO: Test jwt signature
    if (!jwt || expired) {
        displayError('Not logged in! ');
        let loginLink = document.createElement('a');
        loginLink.href = '/login.html';
        loginLink.innerText = 'Click to log in';
        document.getElementById('error').appendChild(loginLink);
        return false;
    }
    return true;
}

function parseJwt (token) {
    var base64Url = token.split('.')[1];
    var base64 = decodeURIComponent(atob(base64Url).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(base64);
};

function displayError(error) {
    document.getElementById('error').innerText = error;
    document.getElementById('error').hidden = false;
}

function request(method, endpoint, payload, callback, raw=false) {
    let jwt = localStorage.getItem('jwt');
    let xhr = new XMLHttpRequest();
    xhr.open(method, `https://api.ai-comp.games/${endpoint}`, /*async=*/true);
    if (!raw) {
        xhr.setRequestHeader('Content-Type', 'application/json');
    }
    xhr.setRequestHeader('Authorization', `Bearer ${jwt}` );
    xhr.onreadystatechange = function() {
        if (this.readyState != 4) return;
        if (this.status < 200 || this.status >= 300) {
            let errorMessage = this.responseText;
            try {
                errorMessage = JSON.parse(this.responseText).message;
            } catch (e) {}
            displayError(`${method} ${endpoint} returned ${this.status} "${errorMessage}"`);
            return;
        }
        let response = JSON.parse(this.responseText);
        if (!response.success) {
            displayError(`${method} ${endpoint} returned "${response.message}"`);
            return;
        }
        callback.call(this);
    }
    if (payload && !raw) {
        payload = JSON.stringify(payload);
    }
    xhr.send(payload);
}
