// 7.1.	Suma de los números pares

const numeros = [1,2,3,4,5]

function sumaNumerosPares(numeros){
    let suma = 0

    for(const numero of numeros){
        if(numero % 2 == 0 ){
            suma += numero
        }
    }

return suma
}

console.log('Ejercicio 7.1 = ', sumaNumerosPares(numeros))

// 7.2.	Elimina las consonantes

const cadena = 'Hola Mundo'

function eliminarConsonantes(cadena){
    const vocales = ['a', 'e', 'i', 'o', 'u', 'A', 'E', 'I', 'O', 'U']
    let resultado = ''

    for(const letra of cadena){
        if(vocales.includes(letra)){
            resultado += letra
        }
    }
    return resultado
}

console.log('Ejercicio 7.2 = ', eliminarConsonantes(cadena))

// 7.3.	Temperatura en grados Fahrenheit 

function celsiusAFahrenheit(gradoCelsius){
    return gradoCelsius * (9/5) + 32
} 

console.log('Ejercicio 7.3 = ', celsiusAFahrenheit(20))

// 7.4.	Pares o impares

function checkNumber(numero){
    if(numero % 2 == 0){
        return 'par'
    } else {
        return 'impar'
    }
}

console.log('Ejercicio 7.4 = ', checkNumber(5))

//7.5.	Mayúscula o minúscula 

// const promptUsuario = prompt('Escribe la cadena a evaluar')

// function mayusOMinus(cadenaDeTexto){
//      if(promptUsuario == promptUsuario.toUpperCase()) {
//          return alert('La cadena está en mayúsculas')
//      } else if (promptUsuario == promptUsuario.toLowerCase()) {
//          return alert('La cadena está en minúsculas')
//      } else {
//          return alert('La cadena tiene mayúsculas y minúsculas')
//      }
//  }

// mayusOMinus(promptUsuario)

// 7.6.	Todo en mayúsculas 

const topics = ['JavaScript', 'Variables', 'funciones', 'condicionales', 'bucles']

function invertirMayus(array){
    const arrayMayus = array.map((topic) => {
        return topic.toUpperCase ()
    })

    arrayMayus.reverse()

    return arrayMayus
}

console.log('Ejercicio 7.6 = ', invertirMayus(topics))

// 7.7.	Separa los pares 

const number = [253, 8575, 1, 20, 562, 1233, 25, 27, 258, 254, 7485, 2683]

function paresArray(arrayNumeros){
    return arrayNumeros.filter(numero => numero % 2 == 0)
}

console.log('Ejercicio 7.7 = ', paresArray(number))

// 7.8.	Concatenación de métodos 

const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']

function mesesLargosMayusculas (arrayMeses){
    return arrayMeses
    .filter((mes)=> mes.length > 7)
    .map((mes) => {
        return mes.toUpperCase()
    })
}

console.log('Ejercicio 7.8 = ', mesesLargosMayusculas(meses))
