type VehicleBrandAndModel = {
  brand: string;
  modelWithYear: string;
  id: string;
};

export function parsePrice(price: string): number {
  try {
    const usdPrice = price.split('$')[1].trim().replace(',', '');

    return Number(usdPrice);
  } catch (error) {
    return undefined;
  }
}

export function getVehicleInfoByNeoauto(vehicleURL: string): VehicleBrandAndModel {
  const parts = vehicleURL.split('/');
  const lastPart = parts[parts.length - 1];
  const regex = /^([a-z]+)-(.+)-(\d+)$/i;
  const [, brand, modelWithYear, id] = lastPart.match(regex) || [];

  return {
    brand,
    modelWithYear,
    id,
  };
}

export function getModelAndYearFromUrl(vehicleURL: string): {
  model: string;
  year: string;
} {
  const regex = /^([\w-]+)-(\d{4})$/i;
  const match = vehicleURL.match(regex);

  if (match) {
    return { model: match[1], year: match[2] };
  } else {
    return {
      model: vehicleURL,
      year: new Date().getFullYear().toString(),
    };
  }
}

export function getEnumKeyByValue(object: any, value: any): string {
  return Object.keys(object).find((key) => object[key] === value);
}
