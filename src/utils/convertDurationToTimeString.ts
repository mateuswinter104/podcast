export function convertDurationToTimeString(duration: number) {
    const hours = Math.floor(duration / 3600);
    const minutes = Math.floor((duration % 3600) / 60) //Quantidades de segundos que sobra da divisão de cima dividido por 60, para dar o resultado em minutos
    const seconds = duration % 60;

    const timeString = [hours, minutes, seconds]
    .map(unit => String(unit).padStart(2, '0')) //padStart: o valor final que der, se tiver apenas um número na frente (1:20s) ele adiciona um '0' na frente (01:20s)
    .join(':')

    return timeString;
}

