<?php
/**
 * Centralized Database Schema & Column Mapping
 * 
 * CRITICAL ARCHITECTURAL COMPONENT:
 * If the real MySQL database uses different table names (e.g., 'tbl_ranandeh', 't_trips', 'orders')
 * or different column names (e.g., 'code_melli' instead of 'national_id', 'pelak' instead of 'license_plate'),
 * simply change the values in this mapping array.
 * 
 * NO SQL queries elsewhere in the application need to be modified!
 */

return [
    // -------------------------------------------------------------
    // Table Names Mapping
    // -------------------------------------------------------------
    'tables' => [
        'drivers'        => getenv('DB_TABLE_DRIVERS') ?: 'drivers',
        'fleets'         => getenv('DB_TABLE_FLEETS') ?: 'fleets',
        'freights'       => getenv('DB_TABLE_FREIGHTS') ?: 'freight_announcements',
        'trips'          => getenv('DB_TABLE_TRIPS') ?: 'trips',
        'chat_history'   => getenv('DB_TABLE_CHAT_HISTORY') ?: 'chat_history',
    ],

    // -------------------------------------------------------------
    // Drivers Table Columns Mapping
    // -------------------------------------------------------------
    'columns' => [
        'drivers' => [
            'id'             => 'id',
            'first_name'     => 'first_name',
            'last_name'      => 'last_name',
            'full_name'      => 'full_name',
            'national_id'    => 'national_id',     // شماره / کد ملی راننده
            'mobile_number'  => 'mobile_number',   // شماره همراه راننده
            'score'          => 'score',           // امتیاز راننده
            'created_at'     => 'created_at',
            'updated_at'     => 'updated_at',
        ],

        // ---------------------------------------------------------
        // Fleets / Vehicles Table Columns Mapping
        // ---------------------------------------------------------
        'fleets' => [
            'id'                 => 'id',
            'license_plate'      => 'license_plate',       // شماره کامیون / پلاک (e.g. 154ع16 ایران 43)
            'smart_fleet_number' => 'smart_fleet_number',  // شماره هوشمند ناوگان
            'vehicle_type'       => 'vehicle_type',        // نوع ناوگان (تک، جفت، تریلی کفی، چادری و ...)
            'vehicle_turn'       => 'vehicle_turn',        // ماشین چهارم، نوبت و ...
            'created_at'         => 'created_at',
            'updated_at'         => 'updated_at',
        ],

        // ---------------------------------------------------------
        // Freight Announcements Table Columns Mapping
        // ---------------------------------------------------------
        'freights' => [
            'id'                   => 'id',
            'announcement_number'  => 'announcement_number',  // شماره اعلام بار (e.g. 249)
            'announcement_type'    => 'announcement_type',    // نوع اول / نوع دوم
            'customer_reference'   => 'customer_reference',   // حواله آقای میرهاشمی / سفارش‌دهنده
            'origin'               => 'origin',               // مبدا بارگیری (e.g. کاشی اصفهان / نجف آباد)
            'destination'          => 'destination',          // مقصد تخلیه (e.g. گمرک شلمچه)
            'cargo_type'           => 'cargo_type',           // نوع محموله (e.g. پالت کاشی میرجلیلی، کیسه جامبو)
            'weight'               => 'weight',               // وزن بار (e.g. 26 تن)
            'net_price'            => 'net_price',            // صافی (کرایه خالص دریافتی راننده e.g. 46 م)
            'total_price'          => 'total_price',          // کل (مبلغ کل اعلام بار e.g. 53 م)
            'commission'           => 'commission',           // کمیسیون اعلام بار (e.g. 500)
            'bill_of_lading_company' => 'bill_of_lading_company', // درخواست بارنامه (e.g. ایمان بار)
            'agent_name'           => 'agent_name',           // نام نماینده باربری (e.g. محمدحسین کرم سیچانی)
            'created_at'           => 'created_at',
            'updated_at'           => 'updated_at',
        ],

        // ---------------------------------------------------------
        // Trips Table Columns Mapping
        // ---------------------------------------------------------
        'trips' => [
            'id'             => 'id',                  // شناسه سفر (e.g. سفر 984#)
            'trip_number'    => 'trip_number',         // شماره سفر
            'driver_id'      => 'driver_id',           // کلید خارجی راننده
            'fleet_id'       => 'fleet_id',            // کلید خارجی ناوگان
            'freight_id'     => 'freight_id',          // کلید خارجی اعلام بار
            'status'         => 'status',              // وضعیت سفر (فعال، رزرو، لغو شده، بارنامه صادر شده)
            'operator_name'  => 'operator_name',       // ثبت‌کننده / اپراتور (e.g. ناصر مدیر / ناصر کرمی)
            'trip_date'      => 'trip_date',           // تاریخ شمسی یا میلادی ثبت سفر (e.g. 1405/06/20 22:36)
            'notes'          => 'notes',               // توضیحات یا متن خام پیام
            'created_at'     => 'created_at',
            'updated_at'     => 'updated_at',
        ],

        // ---------------------------------------------------------
        // Chat History Table Columns Mapping (Optional/Audit)
        // ---------------------------------------------------------
        'chat_history' => [
            'id'             => 'id',
            'user_id'        => 'user_id',
            'raw_message'    => 'raw_message',
            'extracted_json' => 'extracted_json',
            'status'         => 'status',
            'created_at'     => 'created_at',
        ]
    ]
];
