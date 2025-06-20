#!/bin/bash

# HomeKeeper UI Component Testing Suite Runner
# Usage: ./scripts/test-components.sh [component|coverage|watch|a11y]

set -e

echo "🧪 HomeKeeper UI Component Testing Suite"
echo "========================================"

case "$1" in
  "button")
    echo "🔘 Running PrimaryButton Tests..."
    npm test -- --testPathPattern="Button.test.tsx" --verbose
    ;;
  "taskcard")
    echo "📋 Running TaskCard Tests..."
    npm test -- --testPathPattern="TaskCard.test.tsx" --verbose
    ;;
  "coverage")
    echo "📊 Running Component Tests with Coverage..."
    npm test -- --testPathPattern="components" --coverage
    ;;
  "watch")
    echo "👀 Running Component Tests in Watch Mode..."
    npm test -- --testPathPattern="components" --watch
    ;;
  "a11y")
    echo "♿ Running Accessibility-Focused Tests..."
    npm test -- --testPathPattern="components" --verbose | grep -E "(accessibility|a11y|Accessibility)"
    ;;
  "all"|"")
    echo "🚀 Running All Component Tests..."
    npm test -- --testPathPattern="components" --verbose
    ;;
  "help")
    echo "Available commands:"
    echo "  button    - Run PrimaryButton tests only"
    echo "  taskcard  - Run TaskCard tests only"
    echo "  coverage  - Run all component tests with coverage"
    echo "  watch     - Run in watch mode for development"
    echo "  a11y      - Show accessibility test results"
    echo "  all       - Run all component tests (default)"
    echo "  help      - Show this help message"
    ;;
  *)
    echo "❌ Unknown command: $1"
    echo "Run './scripts/test-components.sh help' for available options"
    exit 1
    ;;
esac

echo ""
echo "✅ Testing complete!" 