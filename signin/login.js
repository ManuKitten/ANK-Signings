document.getElementById("loginForm").addEventListener("submit", async function(e) {
  e.preventDefault();

  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  const hashedUser = CryptoJS.SHA256(username).toString();
  const hashedPass = CryptoJS.SHA256(password).toString();

  try {
    const response = await fetch("accounts.json");
    const accounts = await response.json();

    if (accounts[hashedUser] && accounts[hashedUser].password === hashedPass) {
      document.getElementById("message").textContent = "Inicio de sesión exitoso ✅";
      // Aquí puedes redirigir o mostrar contenido privado
    } else {
      document.getElementById("message").textContent = "Usuario o contraseña incorrectos ❌";
    }
  } catch (error) {
    document.getElementById("message").textContent = "Error al cargar cuentas";
    console.error(error);
  }
});
