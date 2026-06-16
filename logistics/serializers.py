from rest_framework import serializers
from .models import Product, Order, OrderItem, Warehouse

class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = '__all__'

class WarehouseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Warehouse
        fields = '__all__'

class OrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.ReadOnlyField(source='product.name')

    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'product_name', 'quantity', 'price_at_purchase']

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    warehouse_details = WarehouseSerializer(source='assigned_warehouse', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = Order,
        fields = [
            'id', 'client', 'assigned_warehouse', 'warehouse_details', 
            'status', 'status_display', 'total_amount', 'delivery_address', 
            'delivery_latitude', 'delivery_longitude', 'stripe_payment_intent_id', 
            'items', 'created_at'
        ]