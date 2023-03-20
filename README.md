# Reporting system

Bootstrapeado con nextjs, este monolito expone servicios de migracion de data desde una api de sonar qube a su propia base
de datos mongoDB debido a las limitaciones que tiene la api de sonar qube respecto a la cantidad de issues que excede
el limite impuesto por su naturaleza la usar elastic search

Tambien expone un servicio de creacion de reportes y una api GRAPHQL que se alimenta del a bd de mongo
esto para mayor disponibilidad de la data con propositos de obsevavilidad y visualziacion de datos

## Bootstraping
Para iniciar en modo desarollo
```bash
$ yarn start:dev
```

Si se tiene errores hay muchas causas las mas probable involucran
- No se proveyo una conexion a una base de mongoDB
- El puerto donde se corre la app ya esta ocupado

Para estas revisar el archivo .envexample y setear las envs necesarias

## Migraciones
La env `SONAT_TOKEN` es opcional, si se quiere hacer las migraciones sin pasar autorizacion se puede setear el valor
de otro modo las migraciones fallaran, por el momento silenciosamente.

Si queremos usar las migraciones sin setear el token en las envs, pasar un token en los request 
como username de la autorizacion, es autorizacion basica

## Graphql
Se activo el playground, solo visitar `http://localhost:<el puerto q seteaste en las envs o 3000 por defecto>/grapqhl`
este es un playground embebido de grahphi

Si se quiere usar el playground del entorno desplegado en dev no se podra, a menos q se use apollo studio pero
no lo recomiendo por la lentitud, mejor en local

## Bases de datos
Se incluye un docker compose que tiene configuracion para las bases de datos
esta depende de los enviroments, se recomienda setearlas desde un inicio

Por el momento basta con la imagen de mongoDB, no es neceario relamente correr la de postgres
se puede incluso trabajar con una istnacia cualquiera de mongo q se tenga corriendo, pero
si no seconfigura los volumenes recordar q se perdera toda la informacion cuando se cierre 
el container q tiene a mongo

El archivo de docker compose tiene perssitencia sencilla, si se usa no se perdera la informacion

La base de postgres servira para los logs y usuarios pero es una funcionalidad pendiente

## Arquitectura
next nos invita siempre a usar una arquitectura que permite la maxima modularuizacion, muy comptaible con la arui hexagonal ya que cada modulo tiene nsus propias funcionalidades a diferencia de otras arquitecturas donde tenemos carpetas dedicadas a cada capa como la onion

Entonces si queremos encontrar algun comportamiento relaciondo por ejemplo con los issues lo encontraremos en la carpeta de issues, como sus migraciones y esquemas
y resolvers para graphql

## Esquemas
Para permitir maxima reutilizacion, se sigue la sugerencia de next de reutilziar los esquemas por ejemplo de mongoDb como esquemas
de grapqhl (code first), para ello nos valemos de decoradores. Esto puede llevar a errores poco informativos si
no se entiende bien lo q se esta realizando, tener cuidado

## Herramientas
Se recomienda leer la documentacion de las herramientas de terceros q se instalo cuando sea necesario
 - Problemas con fechas como formateo?
    - Se instalo daysjs
 - Problemas con complejidad y manupulacion de arrays y objetos?
    - Se instalo lodash
 - Exportar csv (se parece a excel, se puede leer como spreadsheet o mejor dicho hoja de calculo)?
    - Se instalo csv- writter
 - Peticiones HTTP a otros servicios como Sonar?
    -Se instalo axios 

Siempre revisar el package.json , la parte de "dependencies" para ver 
si ya hay una libreria q soluciona el problema q estes presentando
