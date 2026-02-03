const notas = [6, 7, 2, 9, 3, 4, 5, 8, 2, 9, 3, 4, 5, 8, 6, 7]

let sumaFor = 0

for(let i = 0; i < notas.length; i++){
    sumaFor += notas[i]
}

console.log(sumaFor)

let sumaForOf = 0

for (let nota of notas) {
    sumaForOf += nota

}

console.log(sumaForOf)