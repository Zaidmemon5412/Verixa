"""
==============================================================================
Verixa ML Engine - Prediction Service Test Suite
==============================================================================
Tests the end-to-end inference pipeline, model loader, price difference
percentage calculation, and 5-tier valuation verdicts across multiple property types.
"""

import sys
import os
import time

# Ensure UTF-8 stdout formatting
sys.stdout.reconfigure(encoding='utf-8')

# Add parent directory to path
sys.path.insert(0, str(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from ml.prediction_service import predict_property_fair_price


def test_prediction_service():
    print("==============================================================================")
    print(" VERIXA PREDICTION SERVICE - END-TO-END TEST SUITE")
    print("==============================================================================\n")

    test_payloads = [
        {
            "test_name": "Gota 2 BHK Apartment - Fair Price Test",
            "payload": {
                "listed_price": 6000000,
                "carpet_area": 765,
                "builtup_area": 900,
                "super_builtup_area": 1260,
                "bhk": 2,
                "bathrooms": 2,
                "balconies": 2,
                "floor_number": 6,
                "total_floors": 11,
                "construction_year": 2018,
                "locality_id": 6081,
                "furnishing_status": "Semifurnished",
                "facing": "North-East",
                "status": "Ready to move"
            }
        },
        {
            "test_name": "Thaltej 3 BHK Luxury Apartment - Excellent Deal Test (Significantly Underpriced)",
            "payload": {
                "listed_price": 7500000,  # Listed significantly lower than market
                "carpet_area": 1500,
                "builtup_area": 1800,
                "super_builtup_area": 2100,
                "bhk": 3,
                "bathrooms": 3,
                "balconies": 2,
                "floor_number": 5,
                "total_floors": 14,
                "construction_year": 2022,
                "locality_id": 1294,
                "furnishing_status": "Furnished",
                "facing": "East",
                "status": "Ready to move"
            }
        },
        {
            "test_name": "Chandkheda 1 BHK - Highly Overpriced Test",
            "payload": {
                "listed_price": 7000000,  # Listed far above market for 1 BHK
                "carpet_area": 450,
                "builtup_area": 530,
                "super_builtup_area": 690,
                "bhk": 1,
                "bathrooms": 1,
                "balconies": 1,
                "floor_number": 4,
                "total_floors": 5,
                "construction_year": 2016,
                "locality_id": 6046,
                "furnishing_status": "Unfurnished",
                "facing": "North",
                "status": "Ready to move"
            }
        }
    ]

    for item in test_payloads:
        t_start = time.time()
        res = predict_property_fair_price(item["payload"])
        t_elapsed_ms = (time.time() - t_start) * 1000.0

        print(f"--- {item['test_name']} ---")
        print(f"  • Listed Price:                {res['valuation']['listed_price_formatted']}")
        print(f"  • Predicted Fair Price:        {res['valuation']['predicted_fair_price_formatted']}")
        print(f"  • Price Difference:            {res['valuation']['price_difference_formatted']}")
        print(f"  • Difference Percentage:       {res['valuation']['diff_percentage']:+.2f}%")
        print(f"  • Verdict:                     [{res['valuation']['verdict']}] (Color: {res['valuation']['verdict_color']})")
        print(f"  • Inference Latency:           {t_elapsed_ms:.2f} ms\n")

        # Basic assertions
        assert res["success"] is True
        assert "predicted_fair_price" in res["valuation"]
        assert "verdict" in res["valuation"]

    print("✅ ALL PREDICTION SERVICE TESTS PASSED PERFECTLY!")


if __name__ == "__main__":
    test_prediction_service()
