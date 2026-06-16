import math
from decimal import Decimal
from .models import Warehouse, Inventory

def calculate_haversine_distance(lat1, lon1, lat2, lon2):
    """
    Calcula la distancia en kilómetros entre dos coordenadas geográficas
    usando la fórmula del Haversine.
    """
    # Radio de la Tierra en kilómetros
    R = 6371.0

    # Convertir coordenadas de grados a radianes
    phi1 = math.radians(float(lat1))
    phi2 = math.radians(float(lat2))
    delta_phi = math.radians(float(lat2) - float(lat1))
    delta_lambda = math.radians(float(lon2) - float(lon1))

    # Aplicación de la fórmula matemática
    a = math.sin(delta_phi / 2)**2 + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

    distance = R * c
    return distance


def optimize_order_fulfillment(order):
    """
    Analiza los ítems de una orden, filtra los almacenes con stock suficiente
    y asigna el almacén geográficamente más cercano al cliente.
    """
    order_items = order.items.all()
    if not order_items.exists():
        return None

    # 1. Obtener todos los almacenes activos
    warehouses = Warehouse.objects.filter(is_active=True)
    best_warehouse = None
    shortest_distance = float('inf')

    for warehouse in warehouses:
        has_all_stock = True
        
        # 2. Verificar si este almacén tiene stock para TODOS los productos del pedido
        for item in order_items:
            try:
                inventory = Inventory.objects.get(warehouse=warehouse, product=item.product)
                if inventory.stock_quantity < item.quantity:
                    has_all_stock = False
                    break
            except Inventory.DoesNotExist:
                has_all_stock = False
                break

        # 3. Si el almacén cumple con el inventario, medimos la distancia al cliente
        if has_all_stock:
            distance = calculate_haversine_distance(
                order.delivery_latitude, order.delivery_longitude,
                warehouse.latitude, warehouse.longitude
            )
            
            # Guardamos el almacén que esté a la menor distancia
            if distance < shortest_distance:
                shortest_distance = distance
                best_warehouse = warehouse

    # 4. Si encontramos el almacén óptimo, lo asignamos y descontamos el inventario
    if best_warehouse:
        order.assigned_warehouse = best_warehouse
        order.status = 'PROCESSING'  # Cambia automáticamente de "Pendiente" a "Procesando"
        order.save()

        # Descontar el stock físicamente
        for item in order_items:
            inventory = Inventory.objects.get(warehouse=best_warehouse, product=item.product)
            inventory.stock_quantity -= item.quantity
            inventory.save()
            
        return best_warehouse
        
    return None