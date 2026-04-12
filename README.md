# 🚀 Space Jump Shooter

Un juego estilo arcade desarrollado con **HTML5 Canvas y JavaScript**, donde el jugador debe saltar entre plataformas, disparar enemigos y sobrevivir el mayor tiempo posible mientras acumula puntos.

---

## 🎮 Características

- 🧱 Generación dinámica de plataformas  
- 🎯 Sistema de disparo con puntería libre (mouse / touch)  
- 👾 Sistema de jefes progresivos (3 tipos con dificultad creciente)  
- ☄️ Meteoritos como obstáculos dinámicos  
- 📱 Controles adaptados para móvil (swipe + tap)  
- 🖥️ Soporte para pantalla completa  
- 💾 Guardado de récord con `localStorage`  
- 🎨 Efectos visuales (glow, partículas, animaciones)  
- 📘 Tutorial integrado dentro del juego  

---

## 🕹️ Controles

### 💻 PC
- ⬅️ ➡️ Mover personaje  
- 🖱️ Click → Disparar  
- 🎯 Mouse → Apuntar  

### 📱 Móvil
- 👉 Deslizar → Mover  
- 👆 Tap → Disparar  

#### 🔘 Botones en pantalla:
- ⏸️ Pausa  
- ▶️ Reanudar  
- 🔄 Reiniciar  
- ❓ Tutorial  

---

## 🧠 Mecánicas del juego

- El jugador **salta automáticamente** al caer sobre plataformas  
- Cada plataforma puede ser:
  - Normal  
  - Con slime (decorativa)  
- El mundo hace **scroll vertical infinito**  

### 👾 Enemigos:
- 👾 Jefes con vida y ataques  
- ☄️ Meteoritos con colisión física  

### 📊 Sistema de puntuación:
- +50 puntos por plataforma tocada  

### 💀 Fin del juego:
- El jugador cae fuera de pantalla  
- Es golpeado por enemigo o proyectil  

---

## ⚙️ Tecnologías usadas

- HTML5 Canvas  
- JavaScript Vanilla (sin frameworks)  
- CSS básico  
- LocalStorage (para récord)  

---

## 📁 Estructura del proyecto
/assets
 /css
 /img
 /js
index.html
README.md

---

## 🧩 Funcionalidades destacadas

- 🔄 Sistema de reciclaje de plataformas (optimización)  
- 🧠 IA básica para jefe (movimiento + disparo con error)  
- 💥 Sistema de físicas simple (gravedad + colisiones)  
- 📐 Escalado responsive para PC y móvil  

---

## 👨‍💻 Autor

**Roman Hombre Resendiz Vargas**

---

## ⭐ Nota

Este proyecto fue desarrollado con fines educativos y de práctica en desarrollo de videojuegos con JavaScript.