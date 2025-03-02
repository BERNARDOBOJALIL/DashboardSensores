<?php
// Habilitar registros de errores para depuración
ini_set('display_errors', 1);
ini_set('log_errors', 1);
error_reporting(E_ALL);

// Función de registro para depuración
function debugLog($message) {
    $logFile = "debug.log";
    $timestamp = date("Y-m-d H:i:s");
    $logMessage = "[$timestamp] $message\n";
    file_put_contents($logFile, $logMessage, FILE_APPEND);
}

debugLog("Solicitud recibida: " . json_encode($_GET));

// Crear el archivo si no existe
if(!file_exists("datos.txt")) {
    file_put_contents("datos.txt", "0,0,0\r\n");
    debugLog("Archivo datos.txt creado con valores iniciales");
}

// Leer el archivo actual
$ARCHIVO = file_get_contents("datos.txt");
debugLog("Contenido actual de datos.txt: " . trim($ARCHIVO));

// Manejar datos del botón
if(isset($_GET['DATO'])) {
    $DATO_var = $_GET['DATO'];
    debugLog("Valor de DATO recibido: " . $DATO_var);

    $datos_actuales = explode(",", $ARCHIVO);
    $nuevo_texto = $DATO_var . "," . trim($datos_actuales[1]) . "," . trim($datos_actuales[2]) . "\r\n";
    file_put_contents("datos.txt", $nuevo_texto);
    debugLog("Archivo actualizado con valor de DATO: " . $nuevo_texto);

    if(!isset($_GET['view'])) {
        echo "DATO actualizado: " . $DATO_var;
        debugLog("Respuesta enviada para DATO");
        exit;
    }
}

// Manejar datos del PIR
if(isset($_GET['MOVIMIENTO'])) {
    $MOVIMIENTO_var = $_GET['MOVIMIENTO'];
    debugLog("Valor de MOVIMIENTO recibido: " . $MOVIMIENTO_var);

    $datos_actuales = explode(",", $ARCHIVO);
    $nuevo_texto = trim($datos_actuales[0]) . "," . $MOVIMIENTO_var . "," . trim($datos_actuales[2]) . "\r\n";
    file_put_contents("datos.txt", $nuevo_texto);
    debugLog("Archivo actualizado con valor de MOVIMIENTO: " . $nuevo_texto);

    if(!isset($_GET['view'])) {
        echo "MOVIMIENTO actualizado: " . $MOVIMIENTO_var;
        debugLog("Respuesta enviada para MOVIMIENTO");
        exit;
    }
}

// Manejar datos de la temperatura
if(isset($_GET['TEMPERATURA'])) {
    $TEMPERATURA_var = $_GET['TEMPERATURA'];
    debugLog("Valor de TEMPERATURA recibido: " . $TEMPERATURA_var);

    $datos_actuales = explode(",", $ARCHIVO);
    $nuevo_texto = trim($datos_actuales[0]) . "," . trim($datos_actuales[1]) . "," . $TEMPERATURA_var . "\r\n";
    file_put_contents("datos.txt", $nuevo_texto);
    debugLog("Archivo actualizado con valor de TEMPERATURA: " . $nuevo_texto);

    if(!isset($_GET['view'])) {
        echo "TEMPERATURA actualizada: " . $TEMPERATURA_var;
        debugLog("Respuesta enviada para TEMPERATURA");
        exit;
    }
}

// Leer valores actualizados
$ARCHIVO = file_get_contents("datos.txt");
$datos = explode(",", $ARCHIVO);
$DATO_lectura = trim($datos[0]);
$MOVIMIENTO_lectura = trim($datos[1]);
$TEMPERATURA_lectura = trim($datos[2]);

// Si es una solicitud JSON
if(isset($_GET['json'])) {
    header('Content-Type: application/json');
    $response = array(
        'buttonState' => $DATO_lectura,
        'movementState' => $MOVIMIENTO_lectura,
        'temperatureState' => $TEMPERATURA_lectura
    );
    echo json_encode($response);
    debugLog("Enviando respuesta JSON: " . json_encode($response));
    exit;
}

// Colores dinámicos
$colorBoton = ($DATO_lectura == "1") ? "red" : "black";
$colorPIR = ($MOVIMIENTO_lectura == "1") ? "blue" : "black";
?>