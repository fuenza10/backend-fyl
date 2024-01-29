export const removeSeparators = (rut: string) => {
	if (!rut) {
		return '';
	}

	// Removemos cualquier carácter que no sea dígito o la letra K.
	// Luego elimina cualquier instancia extra de la letra K
	// (solo puede haber una al final de un RUT, si es que ese es su DV)
	return rut.replace(/[^0-9kK]/g, '').replace(/[kK]{1,}$/, 'K');
};
/**
 * Le da formato a un RUT, incluyendo separadores de miles. Adecuado para presentación.
 *
 * Por ejemplo, "444444444" o "44444444-4" se convierte en "44.444.444-4".
 * @param rut RUT a formatear
 * @returns El mismo RUT con formato XX.XXX.XXX-X
 */
export const prettifyRut = (rut:string) => {
	if (!rut) {
		return '';
	}

	const cleanRut = removeSeparators(rut);

	// Tenemos una K que no esté al final del RUT?
	if (cleanRut.slice(0, -1).toUpperCase().includes('K')) {
		return '';
	}

	// Separamos el RUT de su DV
	const dv = cleanRut.charAt(cleanRut.length - 1).toUpperCase();
	const rutWithoutDv = cleanRut.slice(0, -1).replace(/^0+/, '');

	const formattedRut = rutWithoutDv
		.toString()
		.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

	// Si hay un sólo dígito de momento, lo dejamos con formato 0-X
	// para que se vea más presentable mientras el usuario tipea el resto
	if (formattedRut === '') {
		return `0-${dv}`;
	}

	return `${formattedRut}-${dv}`;
};