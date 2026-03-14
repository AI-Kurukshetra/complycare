export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      assessments: {
        Row: {
          answers: Json
          compliance_score: number
          created_at: string
          id: string
          organization_id: string | null
          risk_level: string
          risk_score: number
        }
        Insert: {
          answers: Json
          compliance_score: number
          created_at?: string
          id?: string
          organization_id?: string | null
          risk_level: string
          risk_score: number
        }
        Update: {
          answers?: Json
          compliance_score?: number
          created_at?: string
          id?: string
          organization_id?: string | null
          risk_level?: string
          risk_score?: number
        }
        Relationships: [
          {
            foreignKeyName: "assessments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      access_review_items: {
        Row: {
          access_review_id: string | null
          created_at: string
          decision: string
          id: string
          subject: string
        }
        Insert: {
          access_review_id?: string | null
          created_at?: string
          decision?: string
          id?: string
          subject: string
        }
        Update: {
          access_review_id?: string | null
          created_at?: string
          decision?: string
          id?: string
          subject?: string
        }
        Relationships: [
          {
            foreignKeyName: "access_review_items_access_review_id_fkey"
            columns: ["access_review_id"]
            isOneToOne: false
            referencedRelation: "access_reviews"
            referencedColumns: ["id"]
          },
        ]
      }
      access_reviews: {
        Row: {
          created_at: string
          id: string
          organization_id: string | null
          status: string
          title: string
        }
        Insert: {
          created_at?: string
          id?: string
          organization_id?: string | null
          status?: string
          title: string
        }
        Update: {
          created_at?: string
          id?: string
          organization_id?: string | null
          status?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "access_reviews_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      baas: {
        Row: {
          created_at: string
          id: string
          renewal_date: string | null
          status: string
          vendor_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          renewal_date?: string | null
          status?: string
          vendor_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          renewal_date?: string | null
          status?: string
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "baas_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          actor: string | null
          created_at: string
          entity_id: string | null
          entity_type: string
          id: string
          metadata: Json | null
          organization_id: string | null
        }
        Insert: {
          action: string
          actor?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: string
          metadata?: Json | null
          organization_id?: string | null
        }
        Update: {
          action?: string
          actor?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
          metadata?: Json | null
          organization_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_chain_entries: {
        Row: {
          created_at: string
          hash: string
          id: string
          organization_id: string | null
          payload: string
          prev_hash: string | null
        }
        Insert: {
          created_at?: string
          hash: string
          id?: string
          organization_id?: string | null
          payload: string
          prev_hash?: string | null
        }
        Update: {
          created_at?: string
          hash?: string
          id?: string
          organization_id?: string | null
          payload?: string
          prev_hash?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_chain_entries_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      behavior_alerts: {
        Row: {
          created_at: string
          id: string
          organization_id: string | null
          severity: string
          title: string
        }
        Insert: {
          created_at?: string
          id?: string
          organization_id?: string | null
          severity?: string
          title: string
        }
        Update: {
          created_at?: string
          id?: string
          organization_id?: string | null
          severity?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "behavior_alerts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      calendar_tasks: {
        Row: {
          assigned_to: string | null
          completed_at: string | null
          created_at: string
          due_date: string
          id: string
          linked_entity_id: string | null
          notification_days_before: number[]
          organization_id: string | null
          recurrence_rule: string
          status: string
          task_type: string
          title: string
        }
        Insert: {
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string
          due_date: string
          id?: string
          linked_entity_id?: string | null
          notification_days_before?: number[]
          organization_id?: string | null
          recurrence_rule?: string
          status?: string
          task_type?: string
          title: string
        }
        Update: {
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string
          due_date?: string
          id?: string
          linked_entity_id?: string | null
          notification_days_before?: number[]
          organization_id?: string | null
          recurrence_rule?: string
          status?: string
          task_type?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "calendar_tasks_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      pentest_runs: {
        Row: {
          created_at: string
          findings: number
          id: string
          organization_id: string | null
          status: string
        }
        Insert: {
          created_at?: string
          findings?: number
          id?: string
          organization_id?: string | null
          status?: string
        }
        Update: {
          created_at?: string
          findings?: number
          id?: string
          organization_id?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "pentest_runs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          category: string
          created_at: string
          file_name: string
          file_path: string | null
          file_size: number | null
          id: string
          mime_type: string | null
          organization_id: string | null
          parent_document_id: string | null
          search_vector: unknown | null
          storage_path: string | null
          tags: string[]
          title: string
          uploaded_by: string | null
          version: number
        }
        Insert: {
          category?: string
          created_at?: string
          file_name?: string
          file_path?: string | null
          file_size?: number | null
          id?: string
          mime_type?: string | null
          organization_id?: string | null
          parent_document_id?: string | null
          storage_path?: string | null
          tags?: string[]
          title: string
          uploaded_by?: string | null
          version?: number
        }
        Update: {
          category?: string
          created_at?: string
          file_name?: string
          file_path?: string | null
          file_size?: number | null
          id?: string
          mime_type?: string | null
          organization_id?: string | null
          parent_document_id?: string | null
          search_vector?: unknown | null
          storage_path?: string | null
          tags?: string[]
          title?: string
          uploaded_by?: string | null
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "documents_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      compliance_checks: {
        Row: {
          created_at: string
          id: string
          last_checked_at: string | null
          organization_id: string | null
          status: string
          title: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_checked_at?: string | null
          organization_id?: string | null
          status?: string
          title: string
        }
        Update: {
          created_at?: string
          id?: string
          last_checked_at?: string | null
          organization_id?: string | null
          status?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "compliance_checks_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          id: string
          organization_id: string
          user_id: string
          message: string
          link: string | null
          read_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          user_id: string
          message: string
          link?: string | null
          read_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          user_id?: string
          message?: string
          link?: string | null
          read_at?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      regulatory_updates: {
        Row: {
          id: string
          organization_id: string | null
          title: string
          summary: string | null
          effective_date: string | null
          impact: string | null
          impact_level: string
          affected_areas: string[]
          action_required: boolean
          source: string | null
          source_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          organization_id?: string | null
          title: string
          summary?: string | null
          effective_date?: string | null
          impact?: string | null
          impact_level?: string
          affected_areas?: string[]
          action_required?: boolean
          source?: string | null
          source_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          organization_id?: string | null
          title?: string
          summary?: string | null
          effective_date?: string | null
          impact?: string | null
          impact_level?: string
          affected_areas?: string[]
          action_required?: boolean
          source?: string | null
          source_url?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "regulatory_updates_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      risk_actions: {
        Row: {
          action: string
          created_at: string
          due_date: string | null
          id: string
          risk_id: string | null
          status: string
        }
        Insert: {
          action: string
          created_at?: string
          due_date?: string | null
          id?: string
          risk_id?: string | null
          status?: string
        }
        Update: {
          action?: string
          created_at?: string
          due_date?: string | null
          id?: string
          risk_id?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "risk_actions_risk_id_fkey"
            columns: ["risk_id"]
            isOneToOne: false
            referencedRelation: "risks"
            referencedColumns: ["id"]
          },
        ]
      }
      risks: {
        Row: {
          created_at: string
          id: string
          organization_id: string | null
          severity: string
          status: string
          title: string
        }
        Insert: {
          created_at?: string
          id?: string
          organization_id?: string | null
          severity?: string
          status?: string
          title: string
        }
        Update: {
          created_at?: string
          id?: string
          organization_id?: string | null
          severity?: string
          status?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "risks_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      evidence_items: {
        Row: {
          assessment_id: string | null
          category: string | null
          created_at: string
          extracted: Json | null
          file_name: string
          file_type: string | null
          id: string
          summary: string | null
        }
        Insert: {
          assessment_id?: string | null
          category?: string | null
          created_at?: string
          extracted?: Json | null
          file_name: string
          file_type?: string | null
          id?: string
          summary?: string | null
        }
        Update: {
          assessment_id?: string | null
          category?: string | null
          created_at?: string
          extracted?: Json | null
          file_name?: string
          file_type?: string | null
          id?: string
          summary?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "evidence_items_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "assessments"
            referencedColumns: ["id"]
          },
        ]
      }
      vulnerabilities: {
        Row: {
          asset: string | null
          created_at: string
          id: string
          organization_id: string | null
          severity: string
          status: string
          title: string
        }
        Insert: {
          asset?: string | null
          created_at?: string
          id?: string
          organization_id?: string | null
          severity?: string
          status?: string
          title: string
        }
        Update: {
          asset?: string | null
          created_at?: string
          id?: string
          organization_id?: string | null
          severity?: string
          status?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "vulnerabilities_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          name: string
          org_size: string | null
          org_type: string | null
          primary_contact: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          name: string
          org_size?: string | null
          org_type?: string | null
          primary_contact?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          name?: string
          org_size?: string | null
          org_type?: string | null
          primary_contact?: string | null
        }
        Relationships: []
      }
      org_members: {
        Row: {
          created_at: string
          id: string
          organization_id: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          organization_id: string
          role?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          organization_id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "org_members_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      incident_steps: {
        Row: {
          completed_at: string | null
          created_at: string
          id: string
          incident_id: string | null
          status: string
          title: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          id?: string
          incident_id?: string | null
          status?: string
          title: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          id?: string
          incident_id?: string | null
          status?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "incident_steps_incident_id_fkey"
            columns: ["incident_id"]
            isOneToOne: false
            referencedRelation: "incidents"
            referencedColumns: ["id"]
          },
        ]
      }
      incidents: {
        Row: {
          created_at: string
          id: string
          organization_id: string | null
          severity: string
          status: string
          title: string
        }
        Insert: {
          created_at?: string
          id?: string
          organization_id?: string | null
          severity?: string
          status?: string
          title: string
        }
        Update: {
          created_at?: string
          id?: string
          organization_id?: string | null
          severity?: string
          status?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "incidents_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      integration_keys: {
        Row: {
          created_at: string
          id: string
          label: string
          organization_id: string | null
          token: string
        }
        Insert: {
          created_at?: string
          id?: string
          label: string
          organization_id?: string | null
          token: string
        }
        Update: {
          created_at?: string
          id?: string
          label?: string
          organization_id?: string | null
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "integration_keys_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      locations: {
        Row: {
          address: string | null
          created_at: string
          id: string
          name: string
          organization_id: string | null
          status: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          id?: string
          name: string
          organization_id?: string | null
          status?: string
        }
        Update: {
          address?: string | null
          created_at?: string
          id?: string
          name?: string
          organization_id?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "locations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      policy_instances: {
        Row: {
          applied_at: string | null
          created_at: string
          id: string
          last_reviewed: string | null
          organization_id: string | null
          status: string
          template_id: string | null
        }
        Insert: {
          applied_at?: string | null
          created_at?: string
          id?: string
          last_reviewed?: string | null
          organization_id?: string | null
          status?: string
          template_id?: string | null
        }
        Update: {
          applied_at?: string | null
          created_at?: string
          id?: string
          last_reviewed?: string | null
          organization_id?: string | null
          status?: string
          template_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "policy_instances_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "policy_instances_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "policy_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      policy_templates: {
        Row: {
          body: string
          category: string
          created_at: string
          id: string
          title: string
          version: string
        }
        Insert: {
          body: string
          category: string
          created_at?: string
          id?: string
          title: string
          version?: string
        }
        Update: {
          body?: string
          category?: string
          created_at?: string
          id?: string
          title?: string
          version?: string
        }
        Relationships: []
      }
      vendor_assessments: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          score: number
          status: string
          vendor_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          score: number
          status?: string
          vendor_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          score?: number
          status?: string
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vendor_assessments_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      vendors: {
        Row: {
          created_at: string
          criticality: string
          id: string
          name: string
          organization_id: string | null
          status: string
        }
        Insert: {
          created_at?: string
          criticality?: string
          id?: string
          name: string
          organization_id?: string | null
          status?: string
        }
        Update: {
          created_at?: string
          criticality?: string
          id?: string
          name?: string
          organization_id?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendors_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          full_name: string | null
          id: string
          updated_at: string | null
          username: string | null
          website: string | null
        }
        Insert: {
          avatar_url?: string | null
          full_name?: string | null
          id: string
          updated_at?: string | null
          username?: string | null
          website?: string | null
        }
        Update: {
          avatar_url?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string | null
          username?: string | null
          website?: string | null
        }
        Relationships: []
      }
      training_completions: {
        Row: {
          attempts: number
          certificate_url: string | null
          completed_at: string | null
          created_at: string
          id: string
          module_id: string
          score: number | null
          user_id: string
        }
        Insert: {
          attempts?: number
          certificate_url?: string | null
          completed_at?: string | null
          created_at?: string
          id?: string
          module_id: string
          score?: number | null
          user_id: string
        }
        Update: {
          attempts?: number
          certificate_url?: string | null
          completed_at?: string | null
          created_at?: string
          id?: string
          module_id?: string
          score?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "training_completions_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "training_sims"
            referencedColumns: ["id"]
          },
        ]
      }
      training_sims: {
        Row: {
          content_json: Json
          created_at: string
          description: string | null
          due_date: string | null
          estimated_minutes: number
          id: string
          is_required: boolean
          mode: string
          module_type: string
          organization_id: string | null
          passing_score: number
          status: string
          title: string
        }
        Insert: {
          content_json?: Json
          created_at?: string
          description?: string | null
          due_date?: string | null
          estimated_minutes?: number
          id?: string
          is_required?: boolean
          mode?: string
          module_type?: string
          organization_id?: string | null
          passing_score?: number
          status?: string
          title: string
        }
        Update: {
          content_json?: Json
          created_at?: string
          description?: string | null
          due_date?: string | null
          estimated_minutes?: number
          id?: string
          is_required?: boolean
          mode?: string
          module_type?: string
          organization_id?: string | null
          passing_score?: number
          status?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "training_sims_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      iot_devices: {
        Row: {
          compliance_status: string
          created_at: string
          device_type: string | null
          encryption_status: string
          firmware_updated_at: string | null
          firmware_version: string | null
          handles_phi: boolean
          id: string
          ip_address: string | null
          last_seen: string | null
          name: string
          network_exposure: string
          organization_id: string | null
          status: string
        }
        Insert: {
          compliance_status?: string
          created_at?: string
          device_type?: string | null
          encryption_status?: string
          firmware_updated_at?: string | null
          firmware_version?: string | null
          handles_phi?: boolean
          id?: string
          ip_address?: string | null
          last_seen?: string | null
          name: string
          network_exposure?: string
          organization_id?: string | null
          status?: string
        }
        Update: {
          compliance_status?: string
          created_at?: string
          device_type?: string | null
          encryption_status?: string
          firmware_updated_at?: string | null
          firmware_version?: string | null
          handles_phi?: boolean
          id?: string
          ip_address?: string | null
          last_seen?: string | null
          name?: string
          network_exposure?: string
          organization_id?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "iot_devices_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string
          first_name: string | null
          gender: string | null
          id: string
          last_name: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          first_name?: string | null
          gender?: string | null
          id: string
          last_name?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          first_name?: string | null
          gender?: string | null
          id?: string
          last_name?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      reports: {
        Row: {
          assessment_id: string | null
          created_at: string
          id: string
          payload: Json
        }
        Insert: {
          assessment_id?: string | null
          created_at?: string
          id?: string
          payload: Json
        }
        Update: {
          assessment_id?: string | null
          created_at?: string
          id?: string
          payload?: Json
        }
        Relationships: [
          {
            foreignKeyName: "reports_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "assessments"
            referencedColumns: ["id"]
          },
        ]
      }
      secure_messages: {
        Row: {
          created_at: string
          encrypted_payload: string
          id: string
          organization_id: string | null
          recipient: string
          subject: string
        }
        Insert: {
          created_at?: string
          encrypted_payload: string
          id?: string
          organization_id?: string | null
          recipient: string
          subject: string
        }
        Update: {
          created_at?: string
          encrypted_payload?: string
          id?: string
          organization_id?: string | null
          recipient?: string
          subject?: string
        }
        Relationships: [
          {
            foreignKeyName: "secure_messages_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
