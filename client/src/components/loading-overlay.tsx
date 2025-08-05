import { Card, CardContent } from "@/components/ui/card";

export default function LoadingOverlay() {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="shadow-2xl max-w-sm mx-4">
        <CardContent className="p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <div className="animate-spin w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full"></div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2" data-testid="text-loading-title">
              Processing Excel File
            </h3>
            <p className="text-sm text-gray-600 mb-4" data-testid="text-loading-description">
              Analyzing data and generating visualizations...
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-primary-600 h-2 rounded-full transition-all duration-300" 
                style={{ width: '65%' }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-2" data-testid="text-loading-progress">
              Processing your data...
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
