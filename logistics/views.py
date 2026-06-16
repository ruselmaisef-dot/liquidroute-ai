from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import Product, Order, OrderItem
from .serializers import ProductSerializer, OrderSerializer
from .services import optimize_order_fulfillment

class ProductViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API para que React pueda listar y ver los detalles de los productos disponibles.
    """
    queryset = Product.objects.all()
    serializer_serializer_class = ProductSerializer

class OrderViewSet(viewsets.ModelViewSet):
    """
    API para gestionar la creación de órdenes y ejecutar la optimización logística.
    """
    queryset = Order.objects.all()
    serializer_class = OrderSerializer

    def create(self, request, *args, **kwargs):
        """
        Sobrescribimos la creación para capturar los ítems del carrito de React,
        calcular los precios dinámicamente y disparar la optimización de rutas.
        """
        data = request.data
        items_data = data.pop('items', [])

        # 1. Crear la orden base en estado PENDING_PAYMENT
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        order = serializer.save()

        # 2. Registrar los ítems del carrito y calcular el monto total
        total = 0
        for item in items_data:
            product = Product.objects.get(id=item['product'])
            quantity = int(item['quantity'])
            price = product.price
            
            OrderItem.objects.create(
                order=order,
                product=product,
                quantity=quantity,
                price_at_purchase=price
            )
            total += price * quantity

        order.total_amount = total
        order.save()

        # 3. ¡SIMULACIÓN INMEDIATA DEL ALGORITMO LOGÍSTICO!
        # Nota: Más adelante esto se ejecutará tras pagar con Stripe, 
        # pero lo dejamos aquí para probar que tu algoritmo funcione al 100% ya mismo.
        optimized_warehouse = optimize_order_fulfillment(order)

        # Refrescar los datos para enviar la respuesta actualizada a React
        updater_serializer = self.get_serializer(order)
        
        return Response({
            "message": "Orden registrada con éxito",
            "logistics_alert": f"Despachado desde: {optimized_warehouse.name}" if optimized_warehouse else "Sin stock disponible en almacenes cercanos",
            "order": updater_serializer.data
        }, status=status.HTTP_201_CREATED)