# Project Title

La aplicación web SPA de reportería es una aplicación de informes basada en la web que utiliza React, Vite, Material UI y NestJS. La aplicación obtiene datos de una API en SonarQube y muestra informes y análisis de calidad de código a los usuarios finales. La aplicación es una SPA (Single Page Application) que proporciona una experiencia de usuario rápida y sin interrupciones.

## Arquitectura

La aplicación web SPA de reportería se basa en una arquitectura de tres capas que incluye una capa de presentación, una capa de servicios y una capa de datos.

## Capa de presentación

La capa de presentación es la capa de la aplicación que se encarga de la interacción con el usuario final. Esta capa utiliza componentes React, Material UI y Vite para crear una interfaz de usuario interactiva y atractiva para el usuario final. La capa de presentación incluye componentes reutilizables, hooks personalizados y componentes de diseño.

## Capa de servicios

La capa de servicios es la capa de la aplicación que se encarga de comunicarse con la API de SonarQube para obtener los datos necesarios para generar los informes y análisis de calidad de código. Esta capa utiliza NestJS y proveedores de datos personalizados para realizar solicitudes HTTP a la API de SonarQube. La capa de servicios también incluye controladores para las rutas de la API y servicios personalizados para procesar y transformar los datos de la API de SonarQube.

## Capa de datos

La capa de datos es la capa de la aplicación que se encarga de almacenar y recuperar los datos de la aplicación. Esta capa utiliza clases de modelo y repositorios de datos personalizados para interactuar con la base de datos. La capa de datos utiliza una conexión a la base de datos para almacenar y recuperar los datos de la aplicación. La capa de datos se utiliza principalmente en la capa de servicios para interactuar con la base de datos a través de los modelos y repositorios de datos personalizados.

## Estructura de archivos

La aplicación web SPA de reportería utiliza la siguiente estructura de archivos en el directorio src:

- assets: Contiene archivos estáticos como imágenes y fuentes.
- components: Contiene componentes reutilizables utilizados en la capa de presentación.
- config: Contiene archivos de configuración para la aplicación.
- hooks: Contiene hooks personalizados utilizados en la capa de presentación.
- layout: Contiene componentes de diseño utilizados en la capa de presentación.
- lib: Contiene archivos relacionados con la lógica de negocio de la aplicación, incluyendo componentes y servicios relacionados con la autenticación y autorización, controladores para las rutas de API de la capa de servicios, modelos y repositorios de datos utilizados en la capa de datos, clases personalizadas de error utilizadas en la aplicación, proveedores de datos utilizados en la capa de servicios y servicios utilizados en la capa de servicios.
- types: Contiene archivos de tipos de datos personalizados, incluyendo una función que define la forma en que se realizan solicitudes HTTP, tipos de datos para listas utilizadas en la aplicación y tipos de datos para los datos obtenidos de la API de SonarQube.
- utils: Contiene archivos de utilidades, incluyendo archivos que definen la estructura de la aplicación y los enrutadores, la lógica principal de la
