#!/bin/bash

echo "🧪 Testing NutriEmpower Backend Server..."
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test function
test_endpoint() {
    local url=$1
    local expected_status=$2
    local description=$3
    
    echo -n "Testing $description... "
    
    response=$(curl -s -o /dev/null -w "%{http_code}" "$url")
    
    if [ "$response" = "$expected_status" ]; then
        echo -e "${GREEN}✅ PASS${NC} (HTTP $response)"
    else
        echo -e "${RED}❌ FAIL${NC} (Expected HTTP $expected_status, got HTTP $response)"
    fi
}

# Test API endpoint
test_api() {
    local url=$1
    local description=$2
    
    echo -n "Testing $description... "
    
    response=$(curl -s "$url")
    
    if echo "$response" | grep -q "success\|message\|status"; then
        echo -e "${GREEN}✅ PASS${NC}"
    else
        echo -e "${RED}❌ FAIL${NC}"
        echo "Response: $response"
    fi
}

echo ""
echo "🌐 Testing Main Endpoints:"
test_endpoint "http://localhost:5000/" "200" "Landing Page"
test_endpoint "http://localhost:5000/health" "200" "Health Check"
test_endpoint "http://localhost:5000/nonexistent" "404" "404 Error Handling"

echo ""
echo "�� Testing API Endpoints:"
test_api "http://localhost:5000/api/test" "API Test"
test_api "http://localhost:5000/api/nutrition" "Nutrition API"
test_api "http://localhost:5000/api/recipes" "Recipes API"
test_api "http://localhost:5000/api/specialists" "Specialists API"

echo ""
echo "🎨 Testing Static Assets:"
test_endpoint "http://localhost:5000/css/main.css" "200" "Main CSS"
test_endpoint "http://localhost:5000/css/variables.css" "200" "Variables CSS"
test_endpoint "http://localhost:5000/css/components.css" "200" "Components CSS"
test_endpoint "http://localhost:5000/css/responsive.css" "200" "Responsive CSS"
test_endpoint "http://localhost:5000/js/main.js" "200" "Main JavaScript"
test_endpoint "http://localhost:5000/js/chat.js" "200" "Chat JavaScript"

echo ""
echo "🔍 Testing Server Response Times:"
echo -n "Landing page load time... "
time_start=$(date +%s%N)
curl -s http://localhost:5000/ > /dev/null
time_end=$(date +%s%N)
time_diff=$(( (time_end - time_start) / 1000000 ))
echo -e "${GREEN}✅ ${time_diff}ms${NC}"

echo ""
echo "📊 Server Status Summary:"
echo "========================="
echo -e "🌐 Server URL: ${YELLOW}http://localhost:5000${NC}"
echo -e "📊 Health Check: ${YELLOW}http://localhost:5000/health${NC}"
echo -e "🔧 API Test: ${YELLOW}http://localhost:5000/api/test${NC}"
echo ""
echo -e "${GREEN}✅ All tests completed!${NC}"
echo ""
echo "💡 To view the application:"
echo "   1. Open http://localhost:5000 in your browser"
echo "   2. Check browser console for any JavaScript errors"
echo "   3. Verify all styling and functionality works as expected"
