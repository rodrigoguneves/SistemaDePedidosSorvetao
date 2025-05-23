import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import EditCustomerPage from './edit-customer';
import { vi } from 'vitest'; // Using vitest's vi for mocking

// Mock wouter
vi.mock('wouter', () => ({
  useRoute: vi.fn(),
  useLocation: vi.fn(),
}));

// Mock useToast
vi.mock('@/hooks/use-toast', () => ({
  useToast: vi.fn(() => ({
    toast: vi.fn(),
  })),
}));

// Mock fetch
global.fetch = vi.fn();

const mockCustomer = {
  id: 1,
  user_id: 101,
  company_name: 'Test Corp',
  cnpj: '12.345.678/0001-99',
  address: '123 Main St, Anytown, USA',
  phone: '555-1234',
  contact_person: 'John Doe',
  city: 'Anytown',
  state: 'CA',
  postal_code: '90210',
  street: '123 Main St',
  number: 'Unit 1',
  neighborhood: 'Downtown',
  complement: 'Apt B',
  latitude: 34.0522,
  longitude: -118.2437,
  enable_delivery: true,
  delivery_fee: 1000, // R$10.00
  minimum_order_value: 5000, // R$50.00
  allowed_delivery_days: [false, true, true, true, true, true, false],
};

const mockUser = {
  id: 101,
  email: 'test@example.com',
  role: 'customer',
};

const mockProductCategories = [
  { id: 1, name: 'Picolés de Fruta', description: 'Deliciosos picolés feitos com frutas frescas.' },
  { id: 2, name: 'Picolés de Leite', description: 'Picolés cremosos à base de leite.' },
  { id: 3, name: 'Sorvetes Tradicionais', description: 'Sabores clássicos de sorvete em pote.' },
];

const mockSaleUnits = [
  { sale_unit_id: 1, unit_name: 'Unidade', short_description: '1 Un', long_description: 'Venda por unidade' },
  { sale_unit_id: 2, unit_name: 'Caixa Completa 24un', short_description: 'Cx 24un', long_description: 'Caixa com 24 unidades' },
  { sale_unit_id: 3, unit_name: 'Meia Caixa 12un', short_description: 'Cx 12un', long_description: 'Caixa com 12 unidades' },
];

// Customer's assigned categories (product_category_id)
const mockCustomerAssignedCategories = [
  { customer_id: 1, category_id: 1 }, // Picolés de Fruta
  { customer_id: 1, category_id: 2 }, // Picolés de Leite
];

// Customer's allowed sale units
// Structure: { customerCategory: { category_id: PRODUCT_CATEGORY_ID }, sale_unit_id: SALE_UNIT_ID }
const mockCustomerAllowedSaleUnits = [
  { customer_id: 1, customerCategory: { category_id: 1 }, sale_unit_id: 1 }, // Picolés de Fruta - Unidade
  { customer_id: 1, customerCategory: { category_id: 1 }, sale_unit_id: 2 }, // Picolés de Fruta - Caixa 24
  { customer_id: 1, customerCategory: { category_id: 2 }, sale_unit_id: 1 }, // Picolés de Leite - Unidade
];


const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false, // Disable retries for testing
    },
  },
});

const renderComponent = () => {
  // Mock useLocation return value before each render
  (require('wouter').useLocation as ReturnType<typeof vi.fn>).mockReturnValue([
    '/admin/edit-customer/1', // current location path
    vi.fn(), // navigate function mock
  ]);

  return render(
    <QueryClientProvider client={queryClient}>
      <EditCustomerPage />
    </QueryClientProvider>
  );
};


describe('EditCustomerPage Form Population', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Mock useRoute to provide customerId
    (require('wouter').useRoute as ReturnType<typeof vi.fn>).mockReturnValue([
      true, // match
      { id: '1' }, // params
    ]);
    
    (require('@/hooks/use-toast').useToast as ReturnType<typeof vi.fn>).mockReturnValue({
        toast: vi.fn(),
    });

    // Default fetch mock
    (fetch as ReturnType<typeof vi.fn>).mockImplementation(async (url: RequestInfo | URL) => {
      const urlString = url.toString();
      if (urlString.includes(`/api/customers/1/categories`)) {
        return { ok: true, json: async () => mockCustomerAssignedCategories };
      }
      if (urlString.includes(`/api/customers/1/allowed-sale-units`)) {
        return { ok: true, json: async () => mockCustomerAllowedSaleUnits };
      }
      if (urlString.includes(`/api/customers/1`)) {
        return { ok: true, json: async () => mockCustomer };
      }
      if (urlString.includes(`/api/users/101`)) {
        return { ok: true, json: async () => mockUser };
      }
      if (urlString.includes('/api/categories')) {
        return { ok: true, json: async () => mockProductCategories };
      }
      if (urlString.includes('/api/sale-units')) {
        return { ok: true, json: async () => mockSaleUnits };
      }
      return { ok: false, status: 404, json: async () => ({ message: 'Not Found' }) };
    });
  });

  test('should populate CNPJ field', async () => {
    renderComponent();
    // The CNPJ input is identified by its placeholder or current value.
    // Let's use findByDisplayValue for robustness if value is set asynchronously (though CNPJ is not in this case)
    const cnpjInput = await screen.findByDisplayValue(mockCustomer.cnpj);
    expect(cnpjInput).toBeInTheDocument();
  });

  test('should populate Email field (read-only)', async () => {
    renderComponent();
    // Email is populated asynchronously
    const emailInput = await screen.findByDisplayValue(mockUser.email) as HTMLInputElement;
    expect(emailInput).toBeInTheDocument();
    expect(emailInput.readOnly).toBe(true);
  });

  test('should check assigned Product Category checkboxes', async () => {
    renderComponent();
    // Wait for categories to be potentially processed and rendered
    await waitFor(() => {
      expect(screen.getByLabelText('Picolés de Fruta')).toBeInTheDocument();
    });

    const category1Checkbox = screen.getByLabelText('Picolés de Fruta') as HTMLInputElement;
    const category2Checkbox = screen.getByLabelText('Picolés de Leite') as HTMLInputElement;
    const category3Checkbox = screen.getByLabelText('Sorvetes Tradicionais') as HTMLInputElement;

    expect(category1Checkbox.checked).toBe(true);
    expect(category2Checkbox.checked).toBe(true);
    expect(category3Checkbox.checked).toBe(false);
  });

  test('should check allowed Sale Unit checkboxes for selected categories', async () => {
    renderComponent();

    // Wait for categories and units to be loaded and processed
    // Check for a specific sale unit checkbox for a specific category
    // This implies category "Picolés de Fruta" (ID 1) should be loaded and its units displayed
    await waitFor(async () => {
      // Ensure "Picolés de Fruta" category is processed and its section is visible
      expect(screen.getByText('Picolés de Fruta')).toBeInTheDocument();
      // Check for one of its sale units
      const unitCheckboxLabel = `unit-1-1`; // categoryId 1, saleUnitId 1
      const specificSaleUnitCheckbox = await screen.findByRole('checkbox', { name: (accessibleName, element) => element.id === unitCheckboxLabel });
      expect(specificSaleUnitCheckbox).toBeInTheDocument();
    });
    
    // For "Picolés de Fruta" (category ID 1)
    // Mock data: unit 1 ("Unidade") and unit 2 ("Caixa Completa 24un") should be checked
    const fruitCategoryUnit1 = screen.getByRole('checkbox', { name: (accessibleName, element) => element.id === `unit-1-1` }) as HTMLInputElement;
    const fruitCategoryUnit2 = screen.getByRole('checkbox', { name: (accessibleName, element) => element.id === `unit-1-2` }) as HTMLInputElement;
    const fruitCategoryUnit3 = screen.getByRole('checkbox', { name: (accessibleName, element) => element.id === `unit-1-3` }) as HTMLInputElement; // Assuming this exists and should be unchecked

    expect(fruitCategoryUnit1.checked).toBe(true);
    expect(fruitCategoryUnit2.checked).toBe(true);
    expect(fruitCategoryUnit3.checked).toBe(false);

    // For "Picolés de Leite" (category ID 2)
    // Mock data: unit 1 ("Unidade") should be checked
     await waitFor(async () => {
      expect(screen.getByText('Picolés de Leite')).toBeInTheDocument();
      const unitCheckboxLabel = `unit-2-1`; 
      const specificSaleUnitCheckbox = await screen.findByRole('checkbox', { name: (accessibleName, element) => element.id === unitCheckboxLabel });
      expect(specificSaleUnitCheckbox).toBeInTheDocument();
    });

    const milkCategoryUnit1 = screen.getByRole('checkbox', { name: (accessibleName, element) => element.id === `unit-2-1` }) as HTMLInputElement;
    const milkCategoryUnit2 = screen.getByRole('checkbox', { name: (accessibleName, element) => element.id === `unit-2-2` }) as HTMLInputElement; // Assuming this exists and should be unchecked
    
    expect(milkCategoryUnit1.checked).toBe(true);
    expect(milkCategoryUnit2.checked).toBe(false);
  });
});

// Helper to add necessary imports if missing, e.g. @testing-library/jest-dom for .toBeInTheDocument()
// This would typically be in a jest.setup.js or similar
// import '@testing-library/jest-dom';
// For the purpose of this tool, I'll assume it's globally available.
// If running this in a real environment, ensure jest-dom is set up.
