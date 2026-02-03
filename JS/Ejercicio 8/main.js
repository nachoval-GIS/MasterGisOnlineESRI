class Cuadrado {
    constructor(medidaDelLado){
        this.lado = medidaDelLado
    }

    calculoArea(){
        const area = this.lado * this.lado
        console.log('Área del cuadrado: ', area)
    }
    
    calculoPerimetro() {
        const perimetro = this.lado * 4
        console.log('Perímetro del cuadrado: ', perimetro)
    }


}

const cuadrado1 = new Cuadrado(2)

cuadrado1.calculoArea()
cuadrado1.calculoPerimetro()



const cuadrado2 = new Cuadrado(5)

cuadrado2.calculoArea()
cuadrado2.calculoPerimetro()

const cuadrado3 = new Cuadrado(10)

cuadrado3.calculoArea()
cuadrado3.calculoPerimetro()