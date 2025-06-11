function preprocesarProducto(producto) {
    const texto = producto.toLowerCase().trim();
  
    if (texto.includes("café verde")) return "beneficio de café en México";
    if (texto.includes("café tostado")) return "casa tostadora de café en México";
    if (texto.includes("café en grano")) return "distribuidores de café tostado en grano en México";
    if (texto.includes("tambos")) return "fabricantes de tambos plásticos de 200 litros en México";
    if (texto.includes("estibas") || texto.includes("tarimas")) return "fabricantes de tarimas plásticas en México";
    if (texto.includes("botas pvc")) return "fabricantes de botas industriales de PVC en México";
    if (texto.includes("lámina upvc")) return "fabricantes de láminas UPVC de 3 capas en México";
  
    // Si no se encuentra coincidencia, deja pasar el texto original
    return producto;
  }
  
  module.exports = { preprocesarProducto };
  