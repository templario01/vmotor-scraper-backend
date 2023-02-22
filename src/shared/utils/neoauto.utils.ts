type VehicleBrandAndModel = {
  brand: string;
  model: string;
  id: string;
};

export function parsePrice(price: string): number | null {
  try {
    const usdPrice = price.split('$')[1].trim().replace(',', '');

    return Number(usdPrice);
  } catch (error) {
    return null;
  }
}

export function getVehicleInfoByNeoauto(
  vehicleURL: string,
): VehicleBrandAndModel {
  const parts = vehicleURL.split('/');
  const lastPart = parts[parts.length - 1];
  const regex = /^([a-z]+)-([\w-]+)-(\d+)$/i;
  const [, brand, model, id] = lastPart.match(regex) || [];

  return {
    brand,
    model,
    id,
  };
}
