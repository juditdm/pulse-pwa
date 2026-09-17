# Plan de mejoras de Pulse

## Objetivo del plan

Convertir Pulse en una aplicación de registro de fuerza rápida, clara y agradable para utilizar durante el entrenamiento, manteniendo estas prioridades:

- Apariencia de aplicación nativa de iPhone.
- Uso cómodo en un iPhone 13 Pro.
- Funcionamiento offline.
- Sin suscripción obligatoria.
- Registro rápido, con pocos toques.
- Conservación fiable de los datos.
- Progreso útil, no exceso de métricas.

La comparación se inspira principalmente en Strong, Hevy y JEFIT, pero no pretende copiar sus interfaces ni sus elementos de marca.

---

# 1. Referencias del mercado

## Hevy

Hevy se centra en tres pilares: registrar entrenamientos, seguir el progreso y ofrecer funciones sociales. Su registro incluye sets con tipos diferentes, temporizador de descanso, valores del entrenamiento anterior, notas y gráficos de progresión. [web:473][web:474][web:475]

Ideas que podrían aportar valor a Pulse:

- Ver el rendimiento anterior junto al set actual.
- Marcar un set como completado.
- Temporizador de descanso opcional.
- Notas asociadas al ejercicio.
- Récord personal visible inmediatamente.
- Gráficos de peso máximo y repeticiones.

No recomiendo añadir ahora la parte social, likes o comentarios públicos: no encaja con tu objetivo personal y complicaría la privacidad y el funcionamiento offline.

## Strong

Strong populariza un enfoque muy limpio de diario de entrenamiento: ejercicios agrupados, sets claros y seguimiento de récords. Su propuesta destaca por la sencillez del registro y por mostrar la evolución sin sobrecargar la pantalla.

Ideas que encajan con Pulse:

- Pantalla de entrenamiento muy directa.
- Jerarquía visual clara entre ejercicio y set.
- Acciones rápidas.
- Récord personal como dato principal.
- Historial por ejercicio.

## JEFIT

JEFIT es más completo y orientado a planificación, biblioteca de ejercicios, rutinas y análisis. Puede inspirar funciones futuras, pero su amplitud también muestra un riesgo: demasiadas opciones pueden hacer que registrar una serie sea más lento.

Conclusión de la comparación: Pulse debería tomar la rapidez y limpieza de Strong, algunas funciones inteligentes de Hevy y solo las herramientas de planificación que realmente uses.

---

# 2. Principios de diseño

## Principio 1: registrar antes que analizar

Durante una sesión quieres levantar peso, no rellenar formularios largos. El flujo principal debe ser:

```text
Abrir sesión
→ elegir ejercicio
→ introducir reps y peso
→ confirmar set
→ descansar
→ repetir
```

## Principio 2: una acción principal por pantalla

Cada pantalla debería tener un objetivo evidente:

- Resumen: elegir o consultar una sesión.
- Sesión activa: registrar sets.
- Progreso: entender evolución.
- Perfil: copias y preferencias.

## Principio 3: mostrar contexto útil

Antes de introducir un peso, debería ser útil ver:

```text
Último entrenamiento: 40 kg × 10
Mejor marca: 42,5 kg × 8
```

Esto ayuda a decidir el siguiente set sin salir de la pantalla.

## Principio 4: no convertir Pulse en Excel

No necesitamos mostrar todas las métricas posibles. Como has indicado que el volumen no te aporta valor, no lo volveremos a introducir como métrica principal.

## Principio 5: diseño táctil

En iPhone:

- Campos de entrada de al menos 16 píxeles.
- Botones fáciles de pulsar.
- Nada importante dependiente de hover.
- Desplazamiento vertical.
- Acciones destructivas separadas y confirmadas.
- Safe areas para la cámara y la barra inferior.

---

# 3. Mejoras por prioridad

## Prioridad 0 — Fiabilidad de datos

Antes de añadir funciones avanzadas:

- Migrar de `localStorage` a IndexedDB.
- Mantener compatibilidad con `pulse_workouts_v1`.
- Importar automáticamente el almacenamiento antiguo.
- Exportar JSON completo.
- Validar copias importadas.
- Añadir versión del formato de datos.
- Crear copias de seguridad manuales.

Motivo: una aplicación de entrenamiento no sirve si existe riesgo de perder meses de sesiones.

## Prioridad 1 — Registro durante el entrenamiento

### 1. Sesión activa

Añadir un concepto claro de sesión en curso:

- Botón `Iniciar entrenamiento`.
- Temporizador de sesión.
- Tipo de entrenamiento.
- Fecha.
- Botón `Finalizar`.
- Guardado automático de cada set.

### 2. Set completado

Cada set debería tener un botón de confirmación:

```text
[✓]  Set 1   10 reps   40 kg
```

Al pulsarlo:

- Se guarda inmediatamente.
- Se marca visualmente como completado.
- Se inicia el descanso si el temporizador está activo.

### 3. Añadir set con un toque

El flujo actual requiere rellenar campos y después añadir filas. Mejor versión:

- El primer set aparece vacío.
- `+ Añadir set` crea la siguiente fila.
- El número se asigna automáticamente.
- Se puede eliminar cualquier set.
- Al completar un set, el foco pasa al siguiente campo relevante.

### 4. Valores anteriores

En cada ejercicio mostrar:

```text
Último: 40 kg × 10
Mejor: 42,5 kg × 8
```

Esta función es una de las mejoras de mayor valor porque permite progresar sin consultar sesiones antiguas. Hevy utiliza precisamente valores anteriores mientras se registra un ejercicio. [web:475][web:478]

### 5. Temporizador de descanso

Añadir un temporizador opcional:

- 60 segundos por defecto.
- Opciones: 45, 60, 90, 120 segundos.
- Pausar.
- Añadir 15 segundos.
- Omitir.

Debe ser opcional, porque no todos los ejercicios necesitan el mismo descanso. Hevy permite configurar temporizadores por ejercicio y desactivarlos cuando no son necesarios. [web:474][web:475]

## Prioridad 2 — Historial y planificación

### 6. Plantillas de entrenamiento

Crear rutinas reutilizables:

```text
Tren superior A
Tren inferior A
Core
```

Al iniciar una sesión desde una plantilla:

- Aparecen los ejercicios.
- Se conservan notas habituales.
- Los sets se preparan automáticamente.
- Se pueden añadir o quitar ejercicios.

### 7. Ejercicios favoritos

En lugar de una biblioteca enorme, comenzar con:

- Favoritos.
- Recientes.
- Buscar ejercicio.
- Crear ejercicio personalizado.

### 8. Duplicar sesión

Botón:

```text
Repetir esta sesión
```

Debe copiar ejercicios y estructura, pero no marcar los nuevos sets como completados.

### 9. Historial por meses

La agrupación mensual actual es correcta. Mejoras posibles:

- Contraer/expandir meses.
- Mostrar número de sesiones.
- Mostrar los tipos más frecuentes.
- Mantener abierto solo el mes actual.

## Prioridad 3 — Progreso

### 10. Récords personales

Para cada ejercicio mostrar:

- Peso máximo.
- Mayor número de repeticiones con un peso.
- Fecha del récord.
- Último rendimiento.
- Diferencia frente al registro anterior.

Ejemplo:

```text
Press banca
Máximo: 42,5 kg
Último: 40 kg × 10
Mejora: +2,5 kg
Récord: 15/09/2026
```

### 11. Evolución por ejercicio

Al pulsar un ejercicio, abrir un detalle con selector de métrica:

- Peso máximo.
- Repeticiones.
- Sesiones realizadas.
- Duración del periodo.

Periodos:

```text
1 mes · 3 meses · Todo
```

Hevy permite consultar gráficos de rendimiento por ejercicio y cambiar el periodo de análisis. [web:478]

### 12. Indicadores de constancia

Como alternativa al volumen:

- Sesiones del mes.
- Días entrenados por semana.
- Racha actual.
- Semana con más sesiones.
- Distribución por tipo: superior, inferior, core.

Estas métricas pueden ser más útiles para tu objetivo de constancia y pérdida de peso sostenible.

### 13. Comparación personal

No necesitamos comparar con otras personas. Mostrar:

```text
Este mes vs. mes anterior
Sesiones: 8 vs. 6
Press banca: 42,5 kg vs. 40 kg
```

## Prioridad 4 — Notas y contexto

### 14. Notas por ejercicio

Ya hemos añadido notas por ejercicio. La siguiente mejora sería distinguir:

- Nota fija de la plantilla.
- Nota de la sesión concreta.

Ejemplo:

```text
Nota habitual: controlar la bajada.
Nota de hoy: molestia ligera en muñeca derecha.
```

### 15. Nota general de sesión

Añadir un campo opcional:

```text
¿Cómo te has encontrado hoy?
```

No debe ser obligatorio.

### 16. Estado del ejercicio

Opcionalmente:

- Completado.
- Parcial.
- Omitido.
- Sustituido.

---

# 4. Mejoras estéticas

## Mantener

- Fondo neutro.
- Verde suave.
- Tarjetas blancas.
- Bordes redondeados.
- Tipografía limpia.
- Barra inferior.
- Aspecto de aplicación iPhone.
- Sets como tarjetas, no tablas anchas.

## Mejorar

### Jerarquía de color

Usar el verde para:

- Acciones positivas.
- Récords.
- Sets completados.
- Elementos seleccionados.

Usar el rojo únicamente para:

- Eliminar.
- Errores.
- Avisos importantes.

### Iconos

Sustituir algunos textos por iconos claros, manteniendo texto accesible:

- Añadir set: `+`.
- Completar: `✓`.
- Eliminar: `×`.
- Progreso: flecha ascendente.
- Ajustes: engranaje.

### Estados vacíos

En lugar de solo:

```text
Todavía no hay ejercicios.
```

Mostrar:

```text
Aún no has registrado ejercicios
Empieza creando tu primera sesión
[+ Nueva sesión]
```

### Feedback

Al guardar un set:

- Animación breve.
- Marca de completado.
- Mensaje pequeño, no una alerta invasiva.

Evitar muchos `alert()` porque interrumpen el entrenamiento.

---

# 5. Mejoras de experiencia de usuario

## Flujo ideal de una sesión

```text
1. Abrir Pulse
2. Pulsar Iniciar entrenamiento
3. Elegir tipo
4. Elegir rutina o ejercicio
5. Ver último rendimiento
6. Introducir reps y peso
7. Pulsar ✓
8. Descansar
9. Repetir
10. Finalizar sesión
```

## Menos escritura

La aplicación debería recordar:

- Último tipo utilizado.
- Ejercicios recientes.
- Último peso.
- Número habitual de sets.
- Duración aproximada.

## Tolerancia a errores

Debe ser fácil:

- Eliminar un set.
- Editar un peso.
- Deshacer una eliminación.
- Recuperar una sesión incompleta.
- Continuar una sesión cerrada accidentalmente.

## Uso con una mano

Los controles principales deben estar en la zona inferior o central, no solo en la parte superior. La barra inferior actual ayuda, pero el botón de confirmar un set debería estar cerca del pulgar.

## Pantalla siempre activa

Añadir una preferencia:

```text
Mantener pantalla activa durante el entrenamiento
```

Hevy incluye una opción equivalente para evitar desbloquear el móvil después de cada set. [web:475]

---

# 6. Priorización recomendada

## Fase A — Fiabilidad

1. IndexedDB.
2. Migración automática desde localStorage.
3. Exportación e importación robustas.
4. Validación de datos.
5. Recuperación de sesiones incompletas.

## Fase B — Registro rápido

6. Sesión activa.
7. Sets completados.
8. Valores anteriores.
9. Eliminar y editar sets.
10. Temporizador de descanso.

## Fase C — Progreso

11. Récords personales.
12. Detalle por ejercicio.
13. Comparación temporal.
14. Constancia semanal.
15. Gráficos sencillos.

## Fase D — Planificación

16. Plantillas.
17. Ejercicios favoritos.
18. Duplicar sesión.
19. Ejercicios personalizados.

## Fase E — Pulido visual

20. Estados vacíos.
21. Feedback no invasivo.
22. Iconos.
23. Animaciones pequeñas.
24. Ajustes de pantalla y preferencias.

---

# 7. Lo que no recomiendo todavía

No añadiría ahora:

- Red social.
- Likes o seguidores.
- Ranking con otras personas.
- Integración compleja con Apple Health.
- IA para crear rutinas.
- Cientos de métricas.
- Suscripciones.
- Sincronización online compleja.
- Calculadora avanzada de volumen si no te interesa.

Estas funciones aumentan la complejidad y no mejoran necesariamente el registro durante el entrenamiento.

---

# 8. Propuesta para decidir

Mi propuesta de ejecución sería:

### Primera mejora

Migrar de `localStorage` a IndexedDB sin cambiar la estética.

### Segunda mejora

Crear el modo `Sesión activa` con:

- Último rendimiento.
- Set completado.
- Eliminar set.
- Temporizador opcional.

### Tercera mejora

Convertir Progreso en una pantalla de récords y evolución por ejercicio.

### Cuarta mejora

Añadir plantillas y duplicar sesiones.

### Quinta mejora

Pulir feedback, iconos y estados vacíos.

Este orden protege primero tus datos, después acelera el uso diario y finalmente añade análisis y planificación.

## Decisiones que necesito de ti

Antes de programar, dime qué elementos te interesan más:

1. ¿Quieres temporizador de descanso?
2. ¿Quieres marcar cada set como completado con un botón `✓`?
3. ¿Quieres ver el último peso usado mientras registras?
4. ¿Prefieres plantillas de entrenamiento?
5. ¿Quieres una pantalla detallada al pulsar un ejercicio?
6. ¿Qué métricas de Progreso te interesan más: récords, constancia, evolución o calendario?
7. ¿Quieres una nota general para toda la sesión además de las notas por ejercicio?
8. ¿Prefieres mantener la estética actual o hacerla más parecida a una app deportiva premium?
