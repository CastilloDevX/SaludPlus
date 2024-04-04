const pagename = window.location.pathname;
let is_user_logged = (localStorage.getItem("user_logged") != null)

if (is_user_logged) {
    if (pagename == "/" || pagename == "/sign-up" || pagename == "/sign-in") {
        window.location.href = "/home"
    }
} else {
    if (pagename == "/home") {
        window.location.href = "/"
    }
}