#!/usr/bin/env python3
"""
ARQUEO Backend API Testing Suite
Tests all backend endpoints for the financial management system
"""

import requests
import json
import base64
from datetime import datetime
import sys
import os

# Get backend URL from frontend .env file
def get_backend_url():
    try:
        with open('/app/frontend/.env', 'r') as f:
            for line in f:
                if line.startswith('EXPO_PUBLIC_BACKEND_URL='):
                    return line.split('=', 1)[1].strip()
    except Exception as e:
        print(f"Error reading frontend .env: {e}")
    return "https://cash-flow-mobile.preview.emergentagent.com"

BASE_URL = get_backend_url()
API_URL = f"{BASE_URL}/api"

print(f"Testing ARQUEO Backend API at: {API_URL}")
print("=" * 60)

# Test data for creating arqueo records
TEST_ARQUEO_DATA = {
    "tienda": "Rusti-K",
    "responsable": "Juan Pérez", 
    "fondo_inicial": 1000.0,
    "venta_tarjetas": 500.0,
    "cordobas_1": 10,
    "cordobas_5": 5,
    "cordobas_10": 3,
    "cordobas_20": 2,
    "cordobas_50": 1,
    "cordobas_100": 2,
    "cordobas_500": 1,
    "dolares_1": 5,
    "dolares_5": 2, 
    "dolares_10": 1,
    "dolares_20": 0,
    "dolares_50": 0,
    "dolares_100": 0,
    "gastos": [
        {"concepto": "Combustible", "monto": 100.0},
        {"concepto": "Mantenimiento", "monto": 50.0}
    ]
}

# Expected calculations based on test data
EXPECTED_TOTAL_CORDOBAS = (10*1 + 5*5 + 3*10 + 2*20 + 1*50 + 2*100 + 1*500)  # 855
EXPECTED_TOTAL_DOLARES = (5*1 + 2*5 + 1*10 + 0*20 + 0*50 + 0*100)  # 25
EXPECTED_TOTAL_DOLARES_CORDOBAS = 25 * 36.5  # 912.5
EXPECTED_TOTAL_GASTOS = 100.0 + 50.0  # 150
EXPECTED_TOTAL_FINAL = 1000.0 + 500.0 + 855 + 912.5 - 150  # 3117.5

def test_root_endpoint():
    """Test GET /api/ - Root endpoint"""
    print("1. Testing Root Endpoint (GET /api/)")
    try:
        response = requests.get(f"{API_URL}/", timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            if "message" in data and "ARQUEO" in data["message"]:
                print("   ✅ Root endpoint working - Returns welcome message")
                return True
            else:
                print(f"   ❌ Root endpoint returned unexpected data: {data}")
                return False
        else:
            print(f"   ❌ Root endpoint failed - Status: {response.status_code}")
            print(f"   Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"   ❌ Root endpoint error: {e}")
        return False

def test_create_arqueo():
    """Test POST /api/arqueo - Create new arqueo record"""
    print("\n2. Testing Create Arqueo (POST /api/arqueo)")
    try:
        response = requests.post(
            f"{API_URL}/arqueo", 
            json=TEST_ARQUEO_DATA,
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            
            # Verify required fields exist
            required_fields = ["id", "tienda", "responsable", "total_cordobas", 
                             "total_dolares", "total_dolares_cordobas", "total_gastos", "total_final"]
            
            missing_fields = [field for field in required_fields if field not in data]
            if missing_fields:
                print(f"   ❌ Missing required fields: {missing_fields}")
                return False, None
            
            # Verify calculations
            calculations_correct = True
            
            if abs(data["total_cordobas"] - EXPECTED_TOTAL_CORDOBAS) > 0.01:
                print(f"   ❌ Incorrect córdobas calculation: Expected {EXPECTED_TOTAL_CORDOBAS}, got {data['total_cordobas']}")
                calculations_correct = False
            
            if abs(data["total_dolares"] - EXPECTED_TOTAL_DOLARES) > 0.01:
                print(f"   ❌ Incorrect dollars calculation: Expected {EXPECTED_TOTAL_DOLARES}, got {data['total_dolares']}")
                calculations_correct = False
            
            if abs(data["total_dolares_cordobas"] - EXPECTED_TOTAL_DOLARES_CORDOBAS) > 0.01:
                print(f"   ❌ Incorrect dollar conversion: Expected {EXPECTED_TOTAL_DOLARES_CORDOBAS}, got {data['total_dolares_cordobas']}")
                calculations_correct = False
            
            if abs(data["total_gastos"] - EXPECTED_TOTAL_GASTOS) > 0.01:
                print(f"   ❌ Incorrect expenses calculation: Expected {EXPECTED_TOTAL_GASTOS}, got {data['total_gastos']}")
                calculations_correct = False
            
            if abs(data["total_final"] - EXPECTED_TOTAL_FINAL) > 0.01:
                print(f"   ❌ Incorrect final total: Expected {EXPECTED_TOTAL_FINAL}, got {data['total_final']}")
                calculations_correct = False
            
            if calculations_correct:
                print("   ✅ Arqueo created successfully with correct calculations")
                print(f"   📊 Calculations: Córdobas={data['total_cordobas']}, Dollars={data['total_dolares']}, Final={data['total_final']}")
                return True, data["id"]
            else:
                print("   ❌ Arqueo created but calculations are incorrect")
                return False, data["id"]
        else:
            print(f"   ❌ Create arqueo failed - Status: {response.status_code}")
            print(f"   Response: {response.text}")
            return False, None
            
    except Exception as e:
        print(f"   ❌ Create arqueo error: {e}")
        return False, None

def test_get_all_arqueos():
    """Test GET /api/arqueo - Get all arqueo records"""
    print("\n3. Testing Get All Arqueos (GET /api/arqueo)")
    try:
        response = requests.get(f"{API_URL}/arqueo", timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            
            if isinstance(data, list):
                print(f"   ✅ Retrieved {len(data)} arqueo records")
                
                # Verify structure of first record if exists
                if len(data) > 0:
                    first_record = data[0]
                    required_fields = ["id", "tienda", "responsable", "total_final"]
                    missing_fields = [field for field in required_fields if field not in first_record]
                    
                    if missing_fields:
                        print(f"   ❌ Records missing required fields: {missing_fields}")
                        return False
                    else:
                        print("   ✅ Records have correct structure")
                
                return True
            else:
                print(f"   ❌ Expected list, got: {type(data)}")
                return False
        else:
            print(f"   ❌ Get all arqueos failed - Status: {response.status_code}")
            print(f"   Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"   ❌ Get all arqueos error: {e}")
        return False

def test_get_specific_arqueo(arqueo_id):
    """Test GET /api/arqueo/{id} - Get specific arqueo record"""
    print(f"\n4. Testing Get Specific Arqueo (GET /api/arqueo/{arqueo_id})")
    
    if not arqueo_id:
        print("   ⚠️  Skipping - No arqueo ID available from create test")
        return False
    
    try:
        response = requests.get(f"{API_URL}/arqueo/{arqueo_id}", timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            
            # Verify it's the correct record
            if data.get("id") == arqueo_id and data.get("tienda") == TEST_ARQUEO_DATA["tienda"]:
                print("   ✅ Retrieved correct specific arqueo record")
                return True
            else:
                print(f"   ❌ Retrieved wrong record or missing data")
                return False
        elif response.status_code == 404:
            print(f"   ❌ Arqueo not found - Status: 404")
            return False
        else:
            print(f"   ❌ Get specific arqueo failed - Status: {response.status_code}")
            print(f"   Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"   ❌ Get specific arqueo error: {e}")
        return False

def test_generate_pdf(arqueo_id):
    """Test POST /api/arqueo/{id}/pdf - Generate PDF for arqueo record"""
    print(f"\n5. Testing PDF Generation (POST /api/arqueo/{arqueo_id}/pdf)")
    
    if not arqueo_id:
        print("   ⚠️  Skipping - No arqueo ID available from create test")
        return False
    
    try:
        response = requests.post(f"{API_URL}/arqueo/{arqueo_id}/pdf", timeout=15)
        
        if response.status_code == 200:
            data = response.json()
            
            # Verify PDF response structure
            if "pdf_base64" in data and "filename" in data:
                # Verify base64 content
                try:
                    pdf_content = base64.b64decode(data["pdf_base64"])
                    if pdf_content.startswith(b'%PDF'):
                        print("   ✅ PDF generated successfully with valid base64 content")
                        print(f"   📄 Filename: {data['filename']}")
                        print(f"   📊 PDF size: {len(pdf_content)} bytes")
                        return True
                    else:
                        print("   ❌ Invalid PDF content in base64")
                        return False
                except Exception as decode_error:
                    print(f"   ❌ Invalid base64 content: {decode_error}")
                    return False
            else:
                print(f"   ❌ Missing required PDF response fields")
                return False
        elif response.status_code == 404:
            print(f"   ❌ Arqueo not found for PDF generation - Status: 404")
            return False
        else:
            print(f"   ❌ PDF generation failed - Status: {response.status_code}")
            print(f"   Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"   ❌ PDF generation error: {e}")
        return False

def test_error_handling():
    """Test error handling for invalid requests"""
    print("\n6. Testing Error Handling")
    
    # Test invalid arqueo creation
    print("   Testing invalid arqueo data...")
    try:
        invalid_data = {"tienda": ""}  # Missing required fields
        response = requests.post(
            f"{API_URL}/arqueo", 
            json=invalid_data,
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        
        if response.status_code >= 400:
            print("   ✅ Properly handles invalid arqueo data")
        else:
            print("   ❌ Should reject invalid arqueo data")
    except Exception as e:
        print(f"   ❌ Error testing invalid data: {e}")
    
    # Test non-existent arqueo retrieval
    print("   Testing non-existent arqueo retrieval...")
    try:
        response = requests.get(f"{API_URL}/arqueo/non-existent-id", timeout=10)
        
        if response.status_code == 404:
            print("   ✅ Properly returns 404 for non-existent arqueo")
        else:
            print(f"   ❌ Should return 404, got {response.status_code}")
    except Exception as e:
        print(f"   ❌ Error testing non-existent arqueo: {e}")

def main():
    """Run all backend tests"""
    print("ARQUEO Backend API Test Suite")
    print("=" * 60)
    
    test_results = []
    arqueo_id = None
    
    # Run all tests
    test_results.append(("Root Endpoint", test_root_endpoint()))
    
    create_success, arqueo_id = test_create_arqueo()
    test_results.append(("Create Arqueo", create_success))
    
    test_results.append(("Get All Arqueos", test_get_all_arqueos()))
    test_results.append(("Get Specific Arqueo", test_get_specific_arqueo(arqueo_id)))
    test_results.append(("PDF Generation", test_generate_pdf(arqueo_id)))
    
    test_error_handling()
    
    # Summary
    print("\n" + "=" * 60)
    print("TEST SUMMARY")
    print("=" * 60)
    
    passed = 0
    total = len(test_results)
    
    for test_name, result in test_results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{test_name:<25} {status}")
        if result:
            passed += 1
    
    print(f"\nResults: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All backend tests PASSED! API is fully functional.")
        return True
    else:
        print("⚠️  Some tests FAILED. Check the details above.")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)