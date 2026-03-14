--
-- PostgreSQL database dump
--

\restrict rmrt98DMxGir68qyX0VIwZbzmqSx8fuRbUpp4ex8oJTpnqwI19y9jwdX7Bi3qws

-- Dumped from database version 15.17
-- Dumped by pg_dump version 15.17

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: psytwin
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO psytwin;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: psytwin
--

COMMENT ON SCHEMA public IS '';


--
-- Name: AlertType; Type: TYPE; Schema: public; Owner: psytwin
--

CREATE TYPE public."AlertType" AS ENUM (
    'HEART_RATE_SURGE',
    'VOICE_TREMOR',
    'SLEEP_ANOMALY',
    'EMOTION_SWING',
    'SOCIAL_WITHDRAWAL',
    'GAIT_ANOMALY',
    'EATING_ANOMALY'
);


ALTER TYPE public."AlertType" OWNER TO psytwin;

--
-- Name: AppointmentStatus; Type: TYPE; Schema: public; Owner: psytwin
--

CREATE TYPE public."AppointmentStatus" AS ENUM (
    'PENDING',
    'CONFIRMED',
    'COMPLETED',
    'CANCELLED',
    'NO_SHOW'
);


ALTER TYPE public."AppointmentStatus" OWNER TO psytwin;

--
-- Name: AppointmentType; Type: TYPE; Schema: public; Owner: psytwin
--

CREATE TYPE public."AppointmentType" AS ENUM (
    'COUNSELING',
    'VR',
    'GROUP'
);


ALTER TYPE public."AppointmentType" OWNER TO psytwin;

--
-- Name: ChannelType; Type: TYPE; Schema: public; Owner: psytwin
--

CREATE TYPE public."ChannelType" AS ENUM (
    'WECHAT_WORK',
    'SMS',
    'EMAIL',
    'APP_PUSH'
);


ALTER TYPE public."ChannelType" OWNER TO psytwin;

--
-- Name: CommentStatus; Type: TYPE; Schema: public; Owner: psytwin
--

CREATE TYPE public."CommentStatus" AS ENUM (
    'ACTIVE',
    'HIDDEN',
    'DELETED'
);


ALTER TYPE public."CommentStatus" OWNER TO psytwin;

--
-- Name: DataSourceStatus; Type: TYPE; Schema: public; Owner: psytwin
--

CREATE TYPE public."DataSourceStatus" AS ENUM (
    'CONNECTED',
    'DISCONNECTED',
    'ERROR'
);


ALTER TYPE public."DataSourceStatus" OWNER TO psytwin;

--
-- Name: DataSourceType; Type: TYPE; Schema: public; Owner: psytwin
--

CREATE TYPE public."DataSourceType" AS ENUM (
    'VR_DEVICE',
    'BAND',
    'AUDIO',
    'RAG'
);


ALTER TYPE public."DataSourceType" OWNER TO psytwin;

--
-- Name: DeviceStatus; Type: TYPE; Schema: public; Owner: psytwin
--

CREATE TYPE public."DeviceStatus" AS ENUM (
    'ONLINE',
    'OFFLINE',
    'IN_USE',
    'MAINTENANCE'
);


ALTER TYPE public."DeviceStatus" OWNER TO psytwin;

--
-- Name: DeviceType; Type: TYPE; Schema: public; Owner: psytwin
--

CREATE TYPE public."DeviceType" AS ENUM (
    'VR',
    'BRACELET',
    'EEG'
);


ALTER TYPE public."DeviceType" OWNER TO psytwin;

--
-- Name: DocStatus; Type: TYPE; Schema: public; Owner: psytwin
--

CREATE TYPE public."DocStatus" AS ENUM (
    'VECTORIZED',
    'PROCESSING',
    'FAILED'
);


ALTER TYPE public."DocStatus" OWNER TO psytwin;

--
-- Name: InterventionType; Type: TYPE; Schema: public; Owner: psytwin
--

CREATE TYPE public."InterventionType" AS ENUM (
    'REGULAR_INTERVIEW',
    'CBT_THERAPY',
    'GROUP_COUNSELING',
    'CRISIS_INTERVENTION',
    'INITIAL_ASSESSMENT'
);


ALTER TYPE public."InterventionType" OWNER TO psytwin;

--
-- Name: MessageStatus; Type: TYPE; Schema: public; Owner: psytwin
--

CREATE TYPE public."MessageStatus" AS ENUM (
    'SENDING',
    'SENT',
    'DELIVERED',
    'READ',
    'FAILED'
);


ALTER TYPE public."MessageStatus" OWNER TO psytwin;

--
-- Name: MessageType; Type: TYPE; Schema: public; Owner: psytwin
--

CREATE TYPE public."MessageType" AS ENUM (
    'TEXT',
    'EMOTION_TAG',
    'CBT_CARD',
    'AUDIO'
);


ALTER TYPE public."MessageType" OWNER TO psytwin;

--
-- Name: NotificationStatus; Type: TYPE; Schema: public; Owner: psytwin
--

CREATE TYPE public."NotificationStatus" AS ENUM (
    'PENDING',
    'SENT',
    'DELIVERED',
    'READ',
    'FAILED'
);


ALTER TYPE public."NotificationStatus" OWNER TO psytwin;

--
-- Name: NotificationType; Type: TYPE; Schema: public; Owner: psytwin
--

CREATE TYPE public."NotificationType" AS ENUM (
    'SYSTEM',
    'APPOINTMENT',
    'CHAT',
    'WARNING',
    'POST',
    'COMMENT'
);


ALTER TYPE public."NotificationType" OWNER TO psytwin;

--
-- Name: PostStatus; Type: TYPE; Schema: public; Owner: psytwin
--

CREATE TYPE public."PostStatus" AS ENUM (
    'ACTIVE',
    'PENDING',
    'HIDDEN',
    'DELETED'
);


ALTER TYPE public."PostStatus" OWNER TO psytwin;

--
-- Name: RiskLevel; Type: TYPE; Schema: public; Owner: psytwin
--

CREATE TYPE public."RiskLevel" AS ENUM (
    'HIGH',
    'MEDIUM',
    'LOW'
);


ALTER TYPE public."RiskLevel" OWNER TO psytwin;

--
-- Name: RoomStatus; Type: TYPE; Schema: public; Owner: psytwin
--

CREATE TYPE public."RoomStatus" AS ENUM (
    'AVAILABLE',
    'IN_USE',
    'MAINTENANCE'
);


ALTER TYPE public."RoomStatus" OWNER TO psytwin;

--
-- Name: Sentiment; Type: TYPE; Schema: public; Owner: psytwin
--

CREATE TYPE public."Sentiment" AS ENUM (
    'POSITIVE',
    'NEGATIVE',
    'NEUTRAL'
);


ALTER TYPE public."Sentiment" OWNER TO psytwin;

--
-- Name: SessionStatus; Type: TYPE; Schema: public; Owner: psytwin
--

CREATE TYPE public."SessionStatus" AS ENUM (
    'ACTIVE',
    'CLOSED',
    'ARCHIVED'
);


ALTER TYPE public."SessionStatus" OWNER TO psytwin;

--
-- Name: SessionType; Type: TYPE; Schema: public; Owner: psytwin
--

CREATE TYPE public."SessionType" AS ENUM (
    'AI',
    'COUNSELOR'
);


ALTER TYPE public."SessionType" OWNER TO psytwin;

--
-- Name: StudentStatus; Type: TYPE; Schema: public; Owner: psytwin
--

CREATE TYPE public."StudentStatus" AS ENUM (
    'ACTIVE',
    'INACTIVE',
    'SUSPENDED'
);


ALTER TYPE public."StudentStatus" OWNER TO psytwin;

--
-- Name: SyncLogStatus; Type: TYPE; Schema: public; Owner: psytwin
--

CREATE TYPE public."SyncLogStatus" AS ENUM (
    'SUCCESS',
    'FAILED',
    'PARTIAL'
);


ALTER TYPE public."SyncLogStatus" OWNER TO psytwin;

--
-- Name: SyncTaskStatus; Type: TYPE; Schema: public; Owner: psytwin
--

CREATE TYPE public."SyncTaskStatus" AS ENUM (
    'IDLE',
    'RUNNING',
    'PAUSED',
    'ERROR'
);


ALTER TYPE public."SyncTaskStatus" OWNER TO psytwin;

--
-- Name: TeacherStatus; Type: TYPE; Schema: public; Owner: psytwin
--

CREATE TYPE public."TeacherStatus" AS ENUM (
    'ACTIVE',
    'INACTIVE',
    'SUSPENDED'
);


ALTER TYPE public."TeacherStatus" OWNER TO psytwin;

--
-- Name: TemplateType; Type: TYPE; Schema: public; Owner: psytwin
--

CREATE TYPE public."TemplateType" AS ENUM (
    'WARNING',
    'CRISIS',
    'REMINDER',
    'SYSTEM'
);


ALTER TYPE public."TemplateType" OWNER TO psytwin;

--
-- Name: TestStatus; Type: TYPE; Schema: public; Owner: psytwin
--

CREATE TYPE public."TestStatus" AS ENUM (
    'SUCCESS',
    'FAILED'
);


ALTER TYPE public."TestStatus" OWNER TO psytwin;

--
-- Name: TriggerType; Type: TYPE; Schema: public; Owner: psytwin
--

CREATE TYPE public."TriggerType" AS ENUM (
    'RISK_LEVEL',
    'HEART_RATE',
    'EMOTION_CHANGE',
    'APPOINTMENT',
    'SYSTEM_EVENT'
);


ALTER TYPE public."TriggerType" OWNER TO psytwin;

--
-- Name: UserRole; Type: TYPE; Schema: public; Owner: psytwin
--

CREATE TYPE public."UserRole" AS ENUM (
    'ADMIN',
    'COUNSELOR',
    'ASSISTANT',
    'TEACHER'
);


ALTER TYPE public."UserRole" OWNER TO psytwin;

--
-- Name: UserStatus; Type: TYPE; Schema: public; Owner: psytwin
--

CREATE TYPE public."UserStatus" AS ENUM (
    'ACTIVE',
    'INACTIVE',
    'SUSPENDED'
);


ALTER TYPE public."UserStatus" OWNER TO psytwin;

--
-- Name: WarningStatus; Type: TYPE; Schema: public; Owner: psytwin
--

CREATE TYPE public."WarningStatus" AS ENUM (
    'PENDING',
    'PROCESSING',
    'RESOLVED'
);


ALTER TYPE public."WarningStatus" OWNER TO psytwin;

--
-- Name: WorkOrderStatus; Type: TYPE; Schema: public; Owner: psytwin
--

CREATE TYPE public."WorkOrderStatus" AS ENUM (
    'PENDING',
    'IN_PROGRESS',
    'COMPLETED'
);


ALTER TYPE public."WorkOrderStatus" OWNER TO psytwin;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: psytwin
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO psytwin;

--
-- Name: ai_documents; Type: TABLE; Schema: public; Owner: psytwin
--

CREATE TABLE public.ai_documents (
    id text NOT NULL,
    name text NOT NULL,
    file_size text NOT NULL,
    upload_date timestamp(3) without time zone NOT NULL,
    status public."DocStatus" NOT NULL,
    vector_status text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.ai_documents OWNER TO psytwin;

--
-- Name: ai_prompt_presets; Type: TABLE; Schema: public; Owner: psytwin
--

CREATE TABLE public.ai_prompt_presets (
    id text NOT NULL,
    label text NOT NULL,
    value text NOT NULL,
    prompt_text text NOT NULL,
    is_active boolean DEFAULT false NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.ai_prompt_presets OWNER TO psytwin;

--
-- Name: alerts; Type: TABLE; Schema: public; Owner: psytwin
--

CREATE TABLE public.alerts (
    id text NOT NULL,
    student_id text NOT NULL,
    type public."AlertType" NOT NULL,
    level public."RiskLevel" NOT NULL,
    alert_time timestamp(3) without time zone NOT NULL,
    source text NOT NULL,
    description text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.alerts OWNER TO psytwin;

--
-- Name: appointments; Type: TABLE; Schema: public; Owner: psytwin
--

CREATE TABLE public.appointments (
    id text NOT NULL,
    student_id text NOT NULL,
    teacher_id text,
    room_id text,
    type public."AppointmentType" NOT NULL,
    date timestamp(3) without time zone NOT NULL,
    time_slot text NOT NULL,
    status public."AppointmentStatus" DEFAULT 'PENDING'::public."AppointmentStatus" NOT NULL,
    reason text,
    cancel_reason text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    feedback_content text,
    feedback_score integer,
    meeting_link text
);


ALTER TABLE public.appointments OWNER TO psytwin;

--
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: psytwin
--

CREATE TABLE public.audit_logs (
    id text NOT NULL,
    user_id text NOT NULL,
    action text NOT NULL,
    resource text NOT NULL,
    resource_id text,
    details jsonb,
    ip_address text,
    user_agent text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.audit_logs OWNER TO psytwin;

--
-- Name: chat_messages; Type: TABLE; Schema: public; Owner: psytwin
--

CREATE TABLE public.chat_messages (
    id text NOT NULL,
    session_id text NOT NULL,
    sender_id text NOT NULL,
    type public."MessageType" DEFAULT 'TEXT'::public."MessageType" NOT NULL,
    content text NOT NULL,
    seq integer DEFAULT 0 NOT NULL,
    emotion_tag text,
    cbt_card jsonb,
    status public."MessageStatus" DEFAULT 'SENT'::public."MessageStatus" NOT NULL,
    is_read boolean DEFAULT false NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.chat_messages OWNER TO psytwin;

--
-- Name: chat_sessions; Type: TABLE; Schema: public; Owner: psytwin
--

CREATE TABLE public.chat_sessions (
    id text NOT NULL,
    student_id text NOT NULL,
    type public."SessionType" NOT NULL,
    title text NOT NULL,
    target_id text,
    target_name text,
    target_avatar text,
    last_message text,
    last_message_at timestamp(3) without time zone,
    unread_count integer DEFAULT 0 NOT NULL,
    status public."SessionStatus" DEFAULT 'ACTIVE'::public."SessionStatus" NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.chat_sessions OWNER TO psytwin;

--
-- Name: comments; Type: TABLE; Schema: public; Owner: psytwin
--

CREATE TABLE public.comments (
    id text NOT NULL,
    post_id text NOT NULL,
    author_id text NOT NULL,
    parent_id text,
    reply_to_id text,
    content text NOT NULL,
    like_count integer DEFAULT 0 NOT NULL,
    status public."CommentStatus" DEFAULT 'ACTIVE'::public."CommentStatus" NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.comments OWNER TO psytwin;

--
-- Name: consultation_rooms; Type: TABLE; Schema: public; Owner: psytwin
--

CREATE TABLE public.consultation_rooms (
    id text NOT NULL,
    name text NOT NULL,
    location text NOT NULL,
    status public."RoomStatus" NOT NULL,
    capacity integer NOT NULL,
    current_student_id text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.consultation_rooms OWNER TO psytwin;

--
-- Name: data_sources; Type: TABLE; Schema: public; Owner: psytwin
--

CREATE TABLE public.data_sources (
    id text NOT NULL,
    name text NOT NULL,
    type public."DataSourceType" NOT NULL,
    enabled boolean DEFAULT true NOT NULL,
    config jsonb,
    last_sync_at timestamp(3) without time zone,
    status public."DataSourceStatus" DEFAULT 'DISCONNECTED'::public."DataSourceStatus" NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.data_sources OWNER TO psytwin;

--
-- Name: devices; Type: TABLE; Schema: public; Owner: psytwin
--

CREATE TABLE public.devices (
    id text NOT NULL,
    name text NOT NULL,
    serial_number text NOT NULL,
    type public."DeviceType" NOT NULL,
    model text,
    status public."DeviceStatus" NOT NULL,
    battery integer,
    room text,
    location text,
    last_active text,
    last_sync text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.devices OWNER TO psytwin;

--
-- Name: document_chunks; Type: TABLE; Schema: public; Owner: psytwin
--

CREATE TABLE public.document_chunks (
    id text NOT NULL,
    document_id text NOT NULL,
    content text NOT NULL,
    embedding text,
    chunk_index integer NOT NULL,
    metadata jsonb,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.document_chunks OWNER TO psytwin;

--
-- Name: expression_data; Type: TABLE; Schema: public; Owner: psytwin
--

CREATE TABLE public.expression_data (
    id text NOT NULL,
    student_id text NOT NULL,
    "timestamp" timestamp(3) without time zone NOT NULL,
    primary_expression text NOT NULL,
    anxiety_level double precision NOT NULL,
    sadness_level double precision NOT NULL,
    anger_level double precision NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.expression_data OWNER TO psytwin;

--
-- Name: faculties; Type: TABLE; Schema: public; Owner: psytwin
--

CREATE TABLE public.faculties (
    id text NOT NULL,
    name text NOT NULL,
    campus_x double precision,
    campus_y double precision,
    stress_index double precision,
    risk_level public."RiskLevel" DEFAULT 'LOW'::public."RiskLevel" NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.faculties OWNER TO psytwin;

--
-- Name: intervention_details; Type: TABLE; Schema: public; Owner: psytwin
--

CREATE TABLE public.intervention_details (
    id text NOT NULL,
    record_id text NOT NULL,
    pre_mood text,
    pre_anxiety_level integer,
    pre_depression_level integer,
    pre_stress_level integer,
    main_issues text,
    risk_level text,
    risk_assessment text,
    session_content text,
    techniques_used text[],
    student_engagement text,
    key_points text,
    emotional_changes text,
    post_mood text,
    post_anxiety_level integer,
    post_depression_level integer,
    post_stress_level integer,
    improvement_score integer,
    breakthrough_points text,
    unfinished_issues text,
    follow_up_actions text,
    next_appointment timestamp(3) without time zone,
    referrals text,
    recommendations text,
    private_notes text,
    attachments text[],
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.intervention_details OWNER TO psytwin;

--
-- Name: intervention_records; Type: TABLE; Schema: public; Owner: psytwin
--

CREATE TABLE public.intervention_records (
    id text NOT NULL,
    student_id text NOT NULL,
    date timestamp(3) without time zone NOT NULL,
    type public."InterventionType" NOT NULL,
    counselor text NOT NULL,
    duration text NOT NULL,
    result text NOT NULL,
    status text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.intervention_records OWNER TO psytwin;

--
-- Name: ip_whitelist; Type: TABLE; Schema: public; Owner: psytwin
--

CREATE TABLE public.ip_whitelist (
    id text NOT NULL,
    ip_address text NOT NULL,
    description text,
    enabled boolean DEFAULT true NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by text
);


ALTER TABLE public.ip_whitelist OWNER TO psytwin;

--
-- Name: notification_channels; Type: TABLE; Schema: public; Owner: psytwin
--

CREATE TABLE public.notification_channels (
    id text NOT NULL,
    name text NOT NULL,
    type public."ChannelType" NOT NULL,
    enabled boolean DEFAULT false NOT NULL,
    config jsonb,
    last_tested_at timestamp(3) without time zone,
    "testStatus" public."TestStatus",
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.notification_channels OWNER TO psytwin;

--
-- Name: notification_histories; Type: TABLE; Schema: public; Owner: psytwin
--

CREATE TABLE public.notification_histories (
    id text NOT NULL,
    rule_id text,
    channel_type public."ChannelType" NOT NULL,
    recipient text NOT NULL,
    title text NOT NULL,
    content text NOT NULL,
    status public."NotificationStatus" NOT NULL,
    error_msg text,
    sent_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    delivered_at timestamp(3) without time zone,
    read_at timestamp(3) without time zone
);


ALTER TABLE public.notification_histories OWNER TO psytwin;

--
-- Name: notification_rules; Type: TABLE; Schema: public; Owner: psytwin
--

CREATE TABLE public.notification_rules (
    id text NOT NULL,
    name text NOT NULL,
    enabled boolean DEFAULT true NOT NULL,
    trigger_type public."TriggerType" NOT NULL,
    trigger_config jsonb NOT NULL,
    channels text[],
    recipients jsonb NOT NULL,
    template_id text,
    silent_override boolean DEFAULT false NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.notification_rules OWNER TO psytwin;

--
-- Name: notification_templates; Type: TABLE; Schema: public; Owner: psytwin
--

CREATE TABLE public.notification_templates (
    id text NOT NULL,
    name text NOT NULL,
    type public."TemplateType" NOT NULL,
    subject text,
    content text NOT NULL,
    variables jsonb,
    updated_at timestamp(3) without time zone NOT NULL,
    updated_by text
);


ALTER TABLE public.notification_templates OWNER TO psytwin;

--
-- Name: post_collections; Type: TABLE; Schema: public; Owner: psytwin
--

CREATE TABLE public.post_collections (
    id text NOT NULL,
    post_id text NOT NULL,
    student_id text NOT NULL,
    collected_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.post_collections OWNER TO psytwin;

--
-- Name: post_likes; Type: TABLE; Schema: public; Owner: psytwin
--

CREATE TABLE public.post_likes (
    id text NOT NULL,
    post_id text NOT NULL,
    student_id text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.post_likes OWNER TO psytwin;

--
-- Name: posts; Type: TABLE; Schema: public; Owner: psytwin
--

CREATE TABLE public.posts (
    id text NOT NULL,
    author_id text NOT NULL,
    content text NOT NULL,
    images text[],
    location text,
    is_anonymous boolean DEFAULT false NOT NULL,
    tags text[],
    like_count integer DEFAULT 0 NOT NULL,
    comment_count integer DEFAULT 0 NOT NULL,
    risk_score double precision,
    view_count integer DEFAULT 0 NOT NULL,
    status public."PostStatus" DEFAULT 'ACTIVE'::public."PostStatus" NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.posts OWNER TO psytwin;

--
-- Name: psych_profiles; Type: TABLE; Schema: public; Owner: psytwin
--

CREATE TABLE public.psych_profiles (
    id text NOT NULL,
    student_id text NOT NULL,
    adversity_quotient integer NOT NULL,
    emotional_stability integer NOT NULL,
    social_tendency integer NOT NULL,
    stress_resistance integer NOT NULL,
    self_awareness integer NOT NULL,
    empathy integer NOT NULL,
    willpower integer NOT NULL,
    adaptability integer NOT NULL,
    overall_score integer NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.psych_profiles OWNER TO psytwin;

--
-- Name: room_devices; Type: TABLE; Schema: public; Owner: psytwin
--

CREATE TABLE public.room_devices (
    id text NOT NULL,
    room_id text NOT NULL,
    device_id text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.room_devices OWNER TO psytwin;

--
-- Name: schedules; Type: TABLE; Schema: public; Owner: psytwin
--

CREATE TABLE public.schedules (
    id text NOT NULL,
    teacher_id text NOT NULL,
    day_of_week integer NOT NULL,
    start_time text NOT NULL,
    end_time text NOT NULL,
    is_available boolean DEFAULT true NOT NULL,
    max_appointments integer DEFAULT 4 NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.schedules OWNER TO psytwin;

--
-- Name: silent_hours; Type: TABLE; Schema: public; Owner: psytwin
--

CREATE TABLE public.silent_hours (
    id text NOT NULL,
    enabled boolean DEFAULT true NOT NULL,
    start_time text NOT NULL,
    end_time text NOT NULL,
    except_level public."RiskLevel" DEFAULT 'HIGH'::public."RiskLevel" NOT NULL
);


ALTER TABLE public.silent_hours OWNER TO psytwin;

--
-- Name: student_notifications; Type: TABLE; Schema: public; Owner: psytwin
--

CREATE TABLE public.student_notifications (
    id text NOT NULL,
    student_id text NOT NULL,
    type public."NotificationType" NOT NULL,
    title text NOT NULL,
    content text NOT NULL,
    action_url text,
    is_read boolean DEFAULT false NOT NULL,
    read_at timestamp(3) without time zone,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.student_notifications OWNER TO psytwin;

--
-- Name: students; Type: TABLE; Schema: public; Owner: psytwin
--

CREATE TABLE public.students (
    id text NOT NULL,
    name text NOT NULL,
    student_no text NOT NULL,
    class_name text NOT NULL,
    faculty_id text,
    gender text,
    birth_date timestamp(3) without time zone,
    mbti text,
    risk_level public."RiskLevel" DEFAULT 'LOW'::public."RiskLevel" NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    avatar text,
    badges jsonb,
    last_login_at timestamp(3) without time zone,
    nickname text,
    password_hash text,
    phone text,
    role text DEFAULT 'student'::text NOT NULL,
    settings jsonb,
    stats jsonb,
    status public."StudentStatus" DEFAULT 'ACTIVE'::public."StudentStatus" NOT NULL,
    join_date timestamp(3) without time zone
);


ALTER TABLE public.students OWNER TO psytwin;

--
-- Name: sync_logs; Type: TABLE; Schema: public; Owner: psytwin
--

CREATE TABLE public.sync_logs (
    id text NOT NULL,
    task_id text NOT NULL,
    started_at timestamp(3) without time zone NOT NULL,
    ended_at timestamp(3) without time zone,
    status public."SyncLogStatus" NOT NULL,
    data_size integer,
    record_count integer,
    error_msg text
);


ALTER TABLE public.sync_logs OWNER TO psytwin;

--
-- Name: sync_tasks; Type: TABLE; Schema: public; Owner: psytwin
--

CREATE TABLE public.sync_tasks (
    id text NOT NULL,
    name text NOT NULL,
    data_source_id text NOT NULL,
    schedule text NOT NULL,
    enabled boolean DEFAULT true NOT NULL,
    status public."SyncTaskStatus" DEFAULT 'IDLE'::public."SyncTaskStatus" NOT NULL,
    last_sync_at timestamp(3) without time zone,
    next_sync_at timestamp(3) without time zone,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.sync_tasks OWNER TO psytwin;

--
-- Name: system_config; Type: TABLE; Schema: public; Owner: psytwin
--

CREATE TABLE public.system_config (
    id text NOT NULL,
    key text NOT NULL,
    value text NOT NULL,
    description text,
    updated_at timestamp(3) without time zone NOT NULL,
    updated_by text
);


ALTER TABLE public.system_config OWNER TO psytwin;

--
-- Name: teachers; Type: TABLE; Schema: public; Owner: psytwin
--

CREATE TABLE public.teachers (
    id text NOT NULL,
    teacher_id text NOT NULL,
    name text NOT NULL,
    phone text NOT NULL,
    avatar text,
    department text NOT NULL,
    title text NOT NULL,
    qualifications text[],
    work_stats jsonb,
    badges jsonb,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    last_login_at timestamp(3) without time zone,
    password_hash text NOT NULL,
    status public."TeacherStatus" DEFAULT 'ACTIVE'::public."TeacherStatus" NOT NULL,
    role public."UserRole" DEFAULT 'TEACHER'::public."UserRole" NOT NULL,
    nickname text
);


ALTER TABLE public.teachers OWNER TO psytwin;

--
-- Name: timeline_events; Type: TABLE; Schema: public; Owner: psytwin
--

CREATE TABLE public.timeline_events (
    id text NOT NULL,
    student_id text NOT NULL,
    date text NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    status text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.timeline_events OWNER TO psytwin;

--
-- Name: users; Type: TABLE; Schema: public; Owner: psytwin
--

CREATE TABLE public.users (
    id text NOT NULL,
    email text NOT NULL,
    name text NOT NULL,
    password_hash text NOT NULL,
    avatar text,
    role public."UserRole" DEFAULT 'TEACHER'::public."UserRole" NOT NULL,
    status public."UserStatus" DEFAULT 'ACTIVE'::public."UserStatus" NOT NULL,
    last_login_at timestamp(3) without time zone,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.users OWNER TO psytwin;

--
-- Name: vital_signs; Type: TABLE; Schema: public; Owner: psytwin
--

CREATE TABLE public.vital_signs (
    id text NOT NULL,
    student_id text NOT NULL,
    "timestamp" timestamp(3) without time zone NOT NULL,
    heart_rate integer NOT NULL,
    hrv double precision,
    gsr double precision,
    stress_index integer,
    blood_oxygen double precision,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.vital_signs OWNER TO psytwin;

--
-- Name: voice_analyses; Type: TABLE; Schema: public; Owner: psytwin
--

CREATE TABLE public.voice_analyses (
    id text NOT NULL,
    student_id text NOT NULL,
    "timestamp" timestamp(3) without time zone NOT NULL,
    sentiment public."Sentiment" NOT NULL,
    tremor_index double precision NOT NULL,
    emotion_label text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.voice_analyses OWNER TO psytwin;

--
-- Name: vr_scenes; Type: TABLE; Schema: public; Owner: psytwin
--

CREATE TABLE public.vr_scenes (
    id text NOT NULL,
    name text NOT NULL,
    description text,
    usage_count integer DEFAULT 0 NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.vr_scenes OWNER TO psytwin;

--
-- Name: vr_sessions; Type: TABLE; Schema: public; Owner: psytwin
--

CREATE TABLE public.vr_sessions (
    id text NOT NULL,
    student_id text NOT NULL,
    scene_id text NOT NULL,
    duration text NOT NULL,
    emotion_before text NOT NULL,
    emotion_after text NOT NULL,
    result public."Sentiment" NOT NULL,
    session_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.vr_sessions OWNER TO psytwin;

--
-- Name: warnings; Type: TABLE; Schema: public; Owner: psytwin
--

CREATE TABLE public.warnings (
    id text NOT NULL,
    student_id text NOT NULL,
    "riskLevel" public."RiskLevel" NOT NULL,
    risk_reason text NOT NULL,
    trigger_source text NOT NULL,
    trigger_content text,
    status public."WarningStatus" DEFAULT 'PENDING'::public."WarningStatus" NOT NULL,
    assigned_to text,
    last_action jsonb,
    notes text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.warnings OWNER TO psytwin;

--
-- Name: work_orders; Type: TABLE; Schema: public; Owner: psytwin
--

CREATE TABLE public.work_orders (
    id text NOT NULL,
    student_id text NOT NULL,
    class_name text NOT NULL,
    trigger text NOT NULL,
    risk_level public."RiskLevel" NOT NULL,
    method text NOT NULL,
    counselor text NOT NULL,
    status public."WorkOrderStatus" NOT NULL,
    date timestamp(3) without time zone NOT NULL,
    detail text,
    summary text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.work_orders OWNER TO psytwin;

--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: psytwin
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
2e2000ec-5d5a-4c53-a4b1-2b161a23555c	da93176958157946b596538fd7cf8a545e1054e300e7fd3b1e16621b929d1c7e	2026-03-06 14:38:10.831891+00	20260305124333_init	\N	\N	2026-03-06 14:38:10.654176+00	1
a1cd8e6f-6bb6-429d-9dd2-19b89e4e6568	a390a3a1be78c1818154e7b05e7ed68d9fa4e0396eae5d1f2c8a04b48749d446	\N	20250308000000_add_pgvector	A migration failed to apply. New migrations cannot be applied before the error is recovered from. Read more about how to resolve migration issues in a production database: https://pris.ly/d/migrate-resolve\n\nMigration name: 20250308000000_add_pgvector\n\nDatabase error code: 0A000\n\nDatabase error:\nERROR: extension "vector" is not available\nDETAIL: Could not open extension control file "/usr/local/share/postgresql/extension/vector.control": No such file or directory.\nHINT: The extension must first be installed on the system where PostgreSQL is running.\n\nDbError { severity: "ERROR", parsed_severity: Some(Error), code: SqlState(E0A000), message: "extension \\"vector\\" is not available", detail: Some("Could not open extension control file \\"/usr/local/share/postgresql/extension/vector.control\\": No such file or directory."), hint: Some("The extension must first be installed on the system where PostgreSQL is running."), position: None, where_: None, schema: None, table: None, column: None, datatype: None, constraint: None, file: Some("extension.c"), line: Some(630), routine: Some("parse_extension_control_file") }\n\n   0: sql_schema_connector::apply_migration::apply_script\n           with migration_name="20250308000000_add_pgvector"\n             at schema-engine\\connectors\\sql-schema-connector\\src\\apply_migration.rs:113\n   1: schema_commands::commands::apply_migrations::Applying migration\n           with migration_name="20250308000000_add_pgvector"\n             at schema-engine\\commands\\src\\commands\\apply_migrations.rs:95\n   2: schema_core::state::ApplyMigrations\n             at schema-engine\\core\\src\\state.rs:260	\N	2026-03-08 06:58:36.965183+00	0
\.


--
-- Data for Name: ai_documents; Type: TABLE DATA; Schema: public; Owner: psytwin
--

COPY public.ai_documents (id, name, file_size, upload_date, status, vector_status, created_at, updated_at) FROM stdin;
doc-1	危机干预指南（第三版）	2.4 MB	2025-11-08 00:00:00	VECTORIZED	ready	2026-03-06 14:38:41.118	2026-03-07 09:23:47.98
doc-2	CBT疗法手册	1.8 MB	2025-10-22 00:00:00	VECTORIZED	ready	2026-03-06 14:38:41.121	2026-03-07 09:23:47.983
doc-3	大学生心理健康评估标准	3.1 MB	2025-12-01 00:00:00	VECTORIZED	ready	2026-03-06 14:38:41.123	2026-03-07 09:23:47.984
doc-4	校园危机事件应急预案	0.9 MB	2026-01-15 00:00:00	VECTORIZED	ready	2026-03-06 14:38:41.124	2026-03-07 09:23:47.985
doc-7	心图 PsyTwin 校园心理健康数字孪生解决方案.md	21.17 KB	2026-03-08 07:41:47.543	VECTORIZED	ready	2026-03-08 07:41:47.545	2026-03-10 10:21:10.993
doc-5	心理咨询伦理规范	0.7 MB	2026-02-10 00:00:00	VECTORIZED	ready	2026-03-06 14:38:41.126	2026-03-10 10:21:23.547
\.


--
-- Data for Name: ai_prompt_presets; Type: TABLE DATA; Schema: public; Owner: psytwin
--

COPY public.ai_prompt_presets (id, label, value, prompt_text, is_active, created_at, updated_at) FROM stdin;
preset-1	星际面试官	star-interviewer	面向面试压力场景的支持型提示词	f	2026-03-06 14:38:41.127	2026-03-07 09:23:47.988
preset-2	日常树洞	daily-confide	日常情绪倾诉支持型提示词	t	2026-03-06 14:38:41.13	2026-03-07 09:23:47.99
preset-3	危机干预专家	crisis-expert	危机识别与转介提示词	f	2026-03-06 14:38:41.131	2026-03-07 09:23:47.992
preset-4	情感疏导师	emotional-guide	情绪调节与共情提示词	f	2026-03-06 14:38:41.132	2026-03-07 09:23:47.994
\.


--
-- Data for Name: alerts; Type: TABLE DATA; Schema: public; Owner: psytwin
--

COPY public.alerts (id, student_id, type, level, alert_time, source, description, created_at, updated_at) FROM stdin;
al-02	stu-zhangmingyuan	HEART_RATE_SURGE	HIGH	2026-03-07 09:23:47.475	vitals	心率持续偏高	2026-03-06 14:38:40.808	2026-03-07 09:23:47.692
al-04	stu-wuzhiyuan	SOCIAL_WITHDRAWAL	HIGH	2026-03-07 09:23:47.475	trajectory	社交隔离迹象明显	2026-03-06 14:38:40.811	2026-03-07 09:23:47.695
al-06	stu-zhaotianyu	HEART_RATE_SURGE	HIGH	2026-03-07 09:23:47.475	vitals	突发心率飙升	2026-03-06 14:38:40.814	2026-03-07 09:23:47.698
al-01	stu-chenyuqing	VOICE_TREMOR	MEDIUM	2026-03-07 09:23:47.475	voice	语音情感异常连续触发	2026-03-06 14:38:40.805	2026-03-07 09:23:47.689
al-03	stu-liusiyuan	SLEEP_ANOMALY	MEDIUM	2026-03-07 09:23:47.475	behavior	连续睡眠不足	2026-03-06 14:38:40.81	2026-03-07 09:23:47.693
al-05	stu-zhouhangyu	VOICE_TREMOR	MEDIUM	2026-03-07 09:23:47.475	voice	语音颤抖频发	2026-03-06 14:38:40.813	2026-03-07 09:23:47.696
al-07	stu-huangsimeng	EATING_ANOMALY	MEDIUM	2026-03-07 09:23:47.475	behavior	进食异常	2026-03-06 14:38:40.817	2026-03-07 09:23:47.699
al-08	stu-linzhihao	GAIT_ANOMALY	MEDIUM	2026-03-07 09:23:47.475	gait	步态模式异常	2026-03-06 14:38:40.818	2026-03-07 09:23:47.701
al-09	stu-wangyuyan	EMOTION_SWING	MEDIUM	2026-03-07 09:23:47.475	expression	情绪波动	2026-03-06 14:38:40.82	2026-03-07 09:23:47.702
al-10	stu-zhangyu	EMOTION_SWING	MEDIUM	2026-03-07 09:23:47.475	multimodal	情绪指标变化异常	2026-03-06 14:38:40.821	2026-03-07 09:23:47.704
\.


--
-- Data for Name: appointments; Type: TABLE DATA; Schema: public; Owner: psytwin
--

COPY public.appointments (id, student_id, teacher_id, room_id, type, date, time_slot, status, reason, cancel_reason, created_at, updated_at, feedback_content, feedback_score, meeting_link) FROM stdin;
apt_010	stu-liusiyuan	t002	room_006	COUNSELING	2026-03-07 16:00:00	14:00-14:50	PENDING	学业压力咨询	\N	2026-03-07 09:23:48.093	2026-03-10 10:28:23.702	\N	\N	\N
apt_011	stu-zhangyu	t001	room_006	COUNSELING	2026-03-07 16:00:00	09:00-09:50	CONFIRMED	焦虑情绪咨询	\N	2026-03-07 09:23:48.093	2026-03-10 10:28:25.145	\N	\N	\N
apt_003	stu-xiaoming	t003	room_002	COUNSELING	2026-02-20 00:00:00	10:00-11:00	COMPLETED	考前焦虑，情绪管理	\N	2026-03-08 15:10:54.491	2026-03-10 10:22:02.274	李老师很专业，给了我很多实用的建议	5	\N
apt_002	stu-xiaoming	t003	room_003	VR	2026-03-06 00:00:00	15:00-16:00	CONFIRMED	VR放松训练	\N	2026-03-08 15:10:54.487	2026-03-10 10:27:55.896	\N	\N	\N
apt_001	stu-xiaoming	t003	room_001	COUNSELING	2026-03-08 00:00:00	14:00-15:00	PENDING	最近睡眠质量较差，想了解改善方法	\N	2026-03-08 15:10:54.481	2026-03-10 10:27:58.717	\N	\N	\N
apt_004	stu-xiaoming	t002	room_004	VR	2026-02-10 00:00:00	14:30-15:30	CANCELLED	设备维护	设备维护中，无法使用	2026-03-08 15:10:54.494	2026-03-10 10:27:58.717	\N	\N	\N
apt_005	stu-xiaoming	t002	room_004	COUNSELING	2026-03-15 00:00:00	14:00-15:00	PENDING	VR体验	\N	2026-03-08 15:55:40.357	2026-03-10 10:28:09.878	\N	\N	\N
apt_006	stu-liusiyuan	t002	room_004	COUNSELING	2026-03-07 16:00:00	14:00-14:50	PENDING	学业压力咨询	\N	2026-03-07 08:49:00.918	2026-03-10 10:28:09.878	\N	\N	\N
apt_007	stu-liusiyuan	t002	room_005	COUNSELING	2026-03-07 16:00:00	14:00-14:50	PENDING	学业压力咨询	\N	2026-03-07 08:53:59.925	2026-03-10 10:28:13.636	\N	\N	\N
apt_008	stu-zhangyu	t001	room_005	COUNSELING	2026-03-07 16:00:00	09:00-09:50	CONFIRMED	焦虑情绪咨询	\N	2026-03-07 08:53:59.925	2026-03-10 10:28:19.564	\N	\N	\N
apt_009	stu-zhangyu	t001	room_006	COUNSELING	2026-03-07 16:00:00	09:00-09:50	CONFIRMED	焦虑情绪咨询	\N	2026-03-07 08:49:00.918	2026-03-10 10:28:19.564	\N	\N	\N
\.


--
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: psytwin
--

COPY public.audit_logs (id, user_id, action, resource, resource_id, details, ip_address, user_agent, created_at) FROM stdin;
\.


--
-- Data for Name: chat_messages; Type: TABLE DATA; Schema: public; Owner: psytwin
--

COPY public.chat_messages (id, session_id, sender_id, type, content, seq, emotion_tag, cbt_card, status, is_read, created_at, updated_at) FROM stdin;
msg_001	session_001	ai-assistant	TEXT	你好！我是 PsyTwin 树洞助手，有什么可以帮助你的吗？	1	\N	\N	READ	t	2026-03-01 10:00:00	2026-03-08 15:10:54.509
msg_003	session_001	ai-assistant	TEXT	焦虑是一种正常的情绪反应。能具体说说是什么让你感到焦虑吗？	3	\N	\N	READ	f	2026-03-01 10:00:00	2026-03-08 15:10:54.52
msg_002	session_001	stu-xiaoming	TEXT	最近感觉有点焦虑...	2	anxious	\N	READ	t	2026-03-01 10:00:00	2026-03-10 10:28:49.883
\.


--
-- Data for Name: chat_sessions; Type: TABLE DATA; Schema: public; Owner: psytwin
--

COPY public.chat_sessions (id, student_id, type, title, target_id, target_name, target_avatar, last_message, last_message_at, unread_count, status, created_at, updated_at) FROM stdin;
session_001	stu-xiaoming	AI	PsyTwin 树洞助手	ai-assistant	PsyTwin 树洞助手	https://picsum.photos/100/100?random=100	你好！有什么我可以帮你的吗？	\N	1	ACTIVE	2026-03-08 15:10:54.498	2026-03-08 15:10:54.498
session_002	stu-xiaoming	COUNSELOR	咨询师小明	t001	王老师	https://picsum.photos/100/100?random=101	好的，我们下次咨询时间定为周三上午可以吗？	\N	0	ACTIVE	2026-03-08 15:10:54.504	2026-03-08 15:10:54.504
\.


--
-- Data for Name: comments; Type: TABLE DATA; Schema: public; Owner: psytwin
--

COPY public.comments (id, post_id, author_id, parent_id, reply_to_id, content, like_count, status, created_at, updated_at) FROM stdin;
r1	post_001	stu-xiaojing	c1	u4	谢谢强哥！	0	ACTIVE	2026-03-08 15:10:54.431	2026-03-08 15:10:54.431
c1	post_001	stu-wangmang	\N	\N	加油！期末必过！	5	ACTIVE	2026-03-08 15:10:54.422	2026-03-08 15:10:54.422
c2	post_001	stu-liulian	\N	\N	我也在操场，怎么没看到你？	2	ACTIVE	2026-03-08 15:10:54.428	2026-03-08 15:10:54.428
337622a7-be4e-4ab3-9f1e-dd3d6b18af2d	post_001	stu-xiaoming	\N	\N	What?	0	ACTIVE	2026-03-08 17:35:42.905	2026-03-10 10:29:12.606
\.


--
-- Data for Name: consultation_rooms; Type: TABLE DATA; Schema: public; Owner: psytwin
--

COPY public.consultation_rooms (id, name, location, status, capacity, current_student_id, created_at, updated_at) FROM stdin;
room-001	心理咨询室 A01	心理中心A201	AVAILABLE	1	\N	2026-03-07 15:35:06.09	2026-03-07 15:35:06.09
room-002	心理咨询室 A02	心理中心A202	IN_USE	1	stu-zhangmingyuan	2026-03-07 15:35:06.092	2026-03-07 15:35:06.092
room-003	心理咨询室 A03	心理中心A203	AVAILABLE	1	\N	2026-03-07 15:35:06.094	2026-03-07 15:35:06.094
room-004	心理咨询室 A04	心理中心A204	MAINTENANCE	1	\N	2026-03-07 15:35:06.095	2026-03-07 15:35:06.095
room-005	心理咨询室 A05	心理中心A205	AVAILABLE	1	\N	2026-03-07 15:35:06.097	2026-03-07 15:35:06.097
room-006	VR体验区 X01	VR体验中心X301	AVAILABLE	3	\N	2026-03-07 15:35:06.099	2026-03-07 15:35:06.099
room-007	VR体验区 X02	VR体验中心X302	AVAILABLE	3	\N	2026-03-07 15:35:06.101	2026-03-07 15:35:06.101
room-008	减压舱 R01	图书馆B101	AVAILABLE	2	\N	2026-03-07 15:35:06.102	2026-03-07 15:35:06.102
room-009	减压舱 R02	学生活动中心C205	AVAILABLE	2	\N	2026-03-07 15:35:06.104	2026-03-07 15:35:06.104
room-010	减压舱 R03	体育馆D301	AVAILABLE	2	\N	2026-03-07 15:35:06.105	2026-03-07 15:35:06.105
\.


--
-- Data for Name: data_sources; Type: TABLE DATA; Schema: public; Owner: psytwin
--

COPY public.data_sources (id, name, type, enabled, config, last_sync_at, status, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: devices; Type: TABLE DATA; Schema: public; Owner: psytwin
--

COPY public.devices (id, name, serial_number, type, model, status, battery, room, location, last_active, last_sync, created_at, updated_at) FROM stdin;
dev-vr-1	Pico 4 Enterprise #1	P4E202401001	VR	Pico 4 Enterprise	ONLINE	85	心理咨询室 A01	心理中心A201	10分钟前	2分钟前	2026-03-07 15:35:06.106	2026-03-07 15:35:06.106
dev-vr-2	Pico 4 Enterprise #2	P4E202401002	VR	Pico 4 Enterprise	IN_USE	72	心理咨询室 A02	心理中心A202	使用中	实时	2026-03-07 15:35:06.109	2026-03-07 15:35:06.109
dev-vr-3	Pico 4 Enterprise #3	P4E202401003	VR	Pico 4 Enterprise	ONLINE	90	心理咨询室 A03	心理中心A203	5分钟前	1分钟前	2026-03-07 15:35:06.11	2026-03-07 15:35:06.11
dev-vr-4	Pico 4 Enterprise #4	P4E202401004	VR	Pico 4 Enterprise	MAINTENANCE	45	心理咨询室 A04	心理中心A204	2小时前	1小时前	2026-03-07 15:35:06.112	2026-03-07 15:35:06.112
dev-vr-5	Pico 4 Enterprise #5	P4E202401005	VR	Pico 4 Enterprise	ONLINE	95	心理咨询室 A05	心理中心A205	3分钟前	实时	2026-03-07 15:35:06.114	2026-03-07 15:35:06.114
dev-vr-6	Pico 4 Pro #1	P4P202401001	VR	Pico 4 Pro	ONLINE	78	VR体验区 X01	VR体验中心X301	15分钟前	5分钟前	2026-03-07 15:35:06.116	2026-03-07 15:35:06.116
dev-vr-7	Pico 4 Pro #2	P4P202401002	VR	Pico 4 Pro	ONLINE	65	VR体验区 X01	VR体验中心X301	30分钟前	10分钟前	2026-03-07 15:35:06.117	2026-03-07 15:35:06.117
dev-vr-8	Meta Quest 3 #1	MQ3202401001	VR	Meta Quest 3	ONLINE	88	VR体验区 X02	VR体验中心X302	8分钟前	2分钟前	2026-03-07 15:35:06.119	2026-03-07 15:35:06.119
dev-vr-9	Meta Quest 3 #2	MQ3202401002	VR	Meta Quest 3	ONLINE	92	VR体验区 X02	VR体验中心X302	12分钟前	3分钟前	2026-03-07 15:35:06.121	2026-03-07 15:35:06.121
dev-vr-10	Meta Quest 3 #3	MQ3202401003	VR	Meta Quest 3	ONLINE	70	减压舱 R01	图书馆B101	20分钟前	8分钟前	2026-03-07 15:35:06.122	2026-03-07 15:35:06.122
dev-br-1	小米手环 9 #1	MW9202401001	BRACELET	小米手环 9	ONLINE	92	心理咨询室 A01	心理中心A201	5分钟前	实时	2026-03-07 15:35:06.123	2026-03-07 15:35:06.123
dev-br-2	小米手环 9 #2	MW9202401002	BRACELET	小米手环 9	IN_USE	68	心理咨询室 A02	心理中心A202	使用中	实时	2026-03-07 15:35:06.125	2026-03-07 15:35:06.125
dev-br-3	小米手环 9 #3	MW9202401003	BRACELET	小米手环 9	ONLINE	85	心理咨询室 A03	心理中心A203	10分钟前	实时	2026-03-07 15:35:06.127	2026-03-07 15:35:06.127
dev-br-4	华为手环 9 #1	HW9202401001	BRACELET	华为手环 9	ONLINE	88	心理咨询室 A04	心理中心A204	12分钟前	实时	2026-03-07 15:35:06.128	2026-03-07 15:35:06.128
dev-br-5	华为手环 9 #2	HW9202401002	BRACELET	华为手环 9	ONLINE	75	心理咨询室 A05	心理中心A205	15分钟前	实时	2026-03-07 15:35:06.13	2026-03-07 15:35:06.13
dev-br-6	小米手环 9 #4	MW9202401004	BRACELET	小米手环 9	ONLINE	78	VR体验区 X01	VR体验中心X301	8分钟前	实时	2026-03-07 15:35:06.131	2026-03-07 15:35:06.131
dev-br-7	小米手环 9 #5	MW9202401005	BRACELET	小米手环 9	ONLINE	90	VR体验区 X02	VR体验中心X302	4分钟前	实时	2026-03-07 15:35:06.133	2026-03-07 15:35:06.133
dev-br-8	华为手环 9 #3	HW9202401003	BRACELET	华为手环 9	ONLINE	82	减压舱 R01	图书馆B101	6分钟前	实时	2026-03-07 15:35:06.134	2026-03-07 15:35:06.134
dev-br-9	小米手环 8 #1	MW8202401001	BRACELET	小米手环 8	OFFLINE	12	减压舱 R02	学生活动中心C205	1天前	6小时前	2026-03-07 15:35:06.135	2026-03-07 15:35:06.135
dev-br-10	华为手环 9 #4	HW9202401004	BRACELET	华为手环 9	ONLINE	95	减压舱 R03	体育馆D301	2分钟前	实时	2026-03-07 15:35:06.137	2026-03-07 15:35:06.137
dev-eeg-1	BrainCo Flex #1	BCF202401001	EEG	BrainCo Flex	OFFLINE	\N	心理咨询室 A01	心理中心A201	3天前	1天前	2026-03-07 15:35:06.138	2026-03-07 15:35:06.138
dev-eeg-2	BrainCo Flex #2	BCF202401002	EEG	BrainCo Flex	IN_USE	\N	心理咨询室 A01	心理中心A201	使用中	实时	2026-03-07 15:35:06.14	2026-03-07 15:35:06.14
dev-eeg-3	BrainCo Flex #3	BCF202401003	EEG	BrainCo Flex	ONLINE	\N	心理咨询室 A02	心理中心A202	1小时前	30分钟前	2026-03-07 15:35:06.142	2026-03-07 15:35:06.142
dev-eeg-4	Emotiv Epoc X #1	EEX202401001	EEG	Emotiv Epoc X	ONLINE	\N	心理咨询室 A03	心理中心A203	45分钟前	20分钟前	2026-03-07 15:35:06.143	2026-03-07 15:35:06.143
dev-eeg-5	Emotiv Epoc X #2	EEX202401002	EEG	Emotiv Epoc X	ONLINE	\N	心理咨询室 A04	心理中心A204	2小时前	1小时前	2026-03-07 15:35:06.145	2026-03-07 15:35:06.145
dev-eeg-6	BrainCo Epoch #1	BCE202401001	EEG	BrainCo Epoch	ONLINE	\N	心理咨询室 A05	心理中心A205	30分钟前	15分钟前	2026-03-07 15:35:06.147	2026-03-07 15:35:06.147
\.


--
-- Data for Name: document_chunks; Type: TABLE DATA; Schema: public; Owner: psytwin
--

COPY public.document_chunks (id, document_id, content, embedding, chunk_index, metadata, created_at, updated_at) FROM stdin;
b944de73-03bb-4755-ac08-0ffd8b139a97	ebb0fd53-35a4-4814-9527-c94048be3a74	回复具备专业医学背景，而非通用的“幻觉”回复。\n- **共情对话引擎**：采用 **SFT（监督微调）** 技术，使 AI 能够识别用户话语中的“冰山底层”情绪，提供非指令性的、支持性的共情反馈。\n\n### 7.4 隐私与伦理计算\n\n- **脱敏处理**：所有视觉与语音数据在本地端进行特征提取，仅上传加密后的特征向量（Embedding）至云端，不存储原始音视频。\n- **算法透明度**：干预方案的生成过程包含”可解释性”模块，向心理老师展示 AI 判定高风险的依据（如：心率异常波动 + 语义消极倾向）。\n\n---\n\n**注**：本文件由 [[PsyTwin-项目总说明]]\n\n	\N	14	{"total": 15, "position": 14}	2026-03-08 07:41:47.791	2026-03-08 07:41:47.791
da3fe354-9740-42d9-99ff-22fa193f8c06	ebb0fd53-35a4-4814-9527-c94048be3a74	.2.4 Qwen 智能配置与 RAG 知识库**\n- **RAG 向量库管理**：支持上传 PDF/Markdown 格式的专业心理咨询手册。**Qwen (通义千问)** 大模型通过检索增强生成（RAG）技术，为咨询师提供具备专业医学背景的干预建议。\n- **场景化 Prompt 策略**：针对不同的 VR 场景（如职场面试、压力释放）配置特定的 AI 人格设定与对话逻辑。\n![[IMG-20260302185550641.png]]\n### 5.3 技术架构与安全规范\n\n| 维度 | 技术实现 |\n| :--- | :--- |\n| **后端架构** | Go 1.22+ (Gin Framework) 实现高并发多模态数据处理 |\n| **前端框架** | Vue 3 (Composition API) + Element Plus + ECharts |\n| **AI 引擎** | Qwen-7B/14B 本地化部署 + LangChainGo 架构 |\n| **数据安全** | 采用非对称加密技术；支持一键脱敏预览，严守隐私伦理 |\n| **信创适配** | 适配国产操作系统（如麒麟、统信）及国产数据库，符合自主可控要求 |\n\n---\n---\n\n## 6. PsyTwin Pocket：微信小程序\n\n### 6.1 产品定位\n\n**心图 PsyTwin Pocket**是整个生态系统的移动端入口，定位为**轻量化、高频互动的心理健康陪伴工具**。\n\n产品的核心价值在于「去标签化」**：让心理监测看起来像日常社交，让求助过程自然无压力。同时为辅导员提供移动端的预警响应与班级管理能力，实现从「手机端初步筛查」到「AI 实体硬件舱线下疗愈」的完整服务闭环。\n\n### 6.2 双端架构与功能\n\nPsyTwin Pocket 采用**学生端 + 教师端**双角色设计，通过统一的登录流程区分身份，登录后自动加载对应角色的 TabBar。\n\n| 角色 | 心友圈 | AI 对话 | 第三 Tab | 我的 |\n|------|--------|---------|----------|------|\n| **学生** | 瀑布流社区、发布、点赞评论 | 7×24h AI 陪伴、情绪标签、CBT卡片 | 心理咨询/VR/团体预约 | 档案、测评、收藏、设置 |\n| **	\N	11	{"total": 15, "position": 11}	2026-03-08 07:41:47.774	2026-03-08 07:41:47.774
a0d429f7-1ce9-4da7-8cc8-fddd18500e98	ebb0fd53-35a4-4814-9527-c94048be3a74	\n## 目录\n\n- [1. 总项目说明](#1-总项目说明)\n- [2. 项目优势与创新点](#2-项目优势与创新点)\n- [3. 技能大赛展示方案](#3-技能大赛展示方案四角色全链路串联)\n- [4. PsyTwin VR：沉浸感知与筛查](#4-psytwin-vr沉浸感知与筛查)\n- [5. PsyTwin Sentinel：后台管理系统](#5-psytwin-sentinel后台管理系统)\n- [6. PsyTwin Pocket：微信小程序](#6-psytwin-pocket微信小程序)\n- [7. PsyTwin AI：多模态情感计算](#7-psytwin-ai多模态情感计算)\n\n---\n\n## 1. 总项目说明\n\n### 1.1 项目背景与痛点\n\n当前大学生心理健康问题呈现高发化态势，抑郁、焦虑等情绪障碍已成为影响学生学业与生活的主要因素。据调查，约 30% 的大学生存在不同程度的心理困扰，但主动寻求帮助的比例不足 10%。然而，传统的校园心理健康工作面临四大核心痛点：\n\n| <div style="width: 70px">**核心痛点**</div> | <div style="width: 70px">**核心痛点**</div> | 问题描述                                                                                                |\n| :-------------------------------------- | :-------------------------------------- | :-------------------------------------------------------------------------------------------------- |\n| **感知扁平化**                               | 单维度、枯燥抗拒、缺乏沉浸、覆盖率低                      | 传统心理筛查过度依赖文字量表，这种“二维、扁平”的静态测量缺乏沉浸场景与多维数据的支撑。它只能触达学生的意识表层，不仅极其枯燥导致覆盖率低，更无法深度挖掘隐藏在潜意识中	\N	0	{"total": 15, "position": 0}	2026-03-08 07:41:47.778	2026-03-08 07:41:47.778
dcdcd752-c005-48f6-b600-9b17c97a0a42	ebb0fd53-35a4-4814-9527-c94048be3a74	统一的登录流程区分身份，登录后自动加载对应角色的 TabBar。\n\n| 角色 | 心友圈 | AI 对话 | 第三 Tab | 我的 |\n|------|--------|---------|----------|------|\n| **学生** | 瀑布流社区、发布、点赞评论 | 7×24h AI 陪伴、情绪标签、CBT卡片 | 心理咨询/VR/团体预约 | 档案、测评、收藏、设置 |\n| **教师** | 浏览校园动态 | 查看对话记录、辅助干预 | 工作台：统计图表、预警列表 | 教师徽章、排班、设置 |\n\n- **学生端特色**：无感情绪监测（规划中）\n- **教师端特色**：预警级别（低/中/高风险）\n\n### 6.3 技术实现\n\n- **框架**：微信小程序 + TDesign Mini Program v1.11.2\n- **语言**：JavaScript\n- **样式**：LESS\n- **Mock 数据系统**：支持离线开发，模拟真实 API 响应\n\n\n## 7. PsyTwin AI：多模态情感计算\n\n### 7.1 多模态数据采集架构 (Data Acquisition)\n\n基于现有硬件链路，系统实时采集以下五类核心数据流：\n\n| 数据流类型 | 硬件设备 | 采集内容 | 应用场景 |\n| :-------- | :------ | :------ | :------ |\n| **视觉流 (Visual)** | 外部摄像机 + Pico 4 Enterprise 内置相机 | 面部微表情(FER)、肢体姿态、眼动轨迹(Gaze Tracking)、瞳孔变化 | 识别焦虑、抑郁、社交回避等情绪特征 |\n| **语音流 (Audio)** | VR 头显麦克风 | 声学特征(音调、能量、语速)、语义内容 | 语音情感识别(SER)、语义分析 |\n| **生理流 (Physiological)** | 小米手环 | 心率(HR)、心率变异性(HRV)、压力指数 | 实时量化心理压力、评估自主神经系统状态 |\n| **交互流 (Interaction)** | Pico 4 6DoF 手柄/手势识别 | 操作频率、手部震颤、反应时 | 行为模式分析、焦虑/愤怒检测 |\n| **脑电流 (EEG)** | BrainCo 脑科学检测设备 | Alph	\N	12	{"total": 15, "position": 12}	2026-03-08 07:41:47.779	2026-03-08 07:41:47.779
e1b984c0-660f-4b33-ad3d-3da53434ddbd	ebb0fd53-35a4-4814-9527-c94048be3a74	--------------------------- |\n| **感知扁平化**                               | 单维度、枯燥抗拒、缺乏沉浸、覆盖率低                      | 传统心理筛查过度依赖文字量表，这种“二维、扁平”的静态测量缺乏沉浸场景与多维数据的支撑。它只能触达学生的意识表层，不仅极其枯燥导致覆盖率低，更无法深度挖掘隐藏在潜意识中的心理特征。          |\n| **结果失真化**                               | 社会期望偏差、伪装健康、高危漏筛                        | 面对心理问卷，学生极易产生"社会期望偏差"（为了迎合外界期望而隐瞒真实想法）。这种"伪装健康"导致测试结果严重失真，真正的"高危个体"在纸面上往往显得十分正常，导致危机隐患在暗处滋生。        |\n| **数据孤岛化**                               | 数据割裂、盲人摸象、被动救火                          | 现有的测评量表、日常情绪记录与咨询记录往往相互割裂，各系统互不连通。缺乏全量多模态的数据交叉验证，导致辅导员只能"盲人摸象"，预警往往滞后于危机发生，使得心理健康工作长期处于疲惫的"被动救火"状态。 |\n| **求助壁垒化**                               | 师生比失衡、病耻感、不敢求助                          | 高校心理教师配备比例普遍不足（平均需服务 3000+ 学生），日常疏导需求面临"无人可求"困境。更致命的是，学生对向老师袒露内心存在极强的"病耻感"和被评判焦虑，宁愿默默内耗也"不敢求助"。     |\n\n\n### 1.2 项目核心逻辑：四步闭环破局方案\n\n**心图 PsyTwin** 筛选出最具针对性的前沿技术，构建了"**沉浸造境-深度捕捉-数字孪生-具身疗愈**"的四步闭环体系。以下为系统的核心解决逻辑与技术接力赛映射：\n\n| <div style="width: 60px">**步骤**</div> | <div style="width: 80px">**破局痛点**</div> | **硬核技术**           	\N	1	{"total": 15, "position": 1}	2026-03-08 07:41:47.785	2026-03-08 07:41:47.785
9c48bcf2-1f67-467a-9636-89f50a169f67	ebb0fd53-35a4-4814-9527-c94048be3a74	*生理流 (Physiological)** | 小米手环 | 心率(HR)、心率变异性(HRV)、压力指数 | 实时量化心理压力、评估自主神经系统状态 |\n| **交互流 (Interaction)** | Pico 4 6DoF 手柄/手势识别 | 操作频率、手部震颤、反应时 | 行为模式分析、焦虑/愤怒检测 |\n| **脑电流 (EEG)** | BrainCo 脑科学检测设备 | Alpha波(放松度)、Beta波(焦虑度)、Theta波(抑郁倾向) | 深层心理特征捕捉、认知负荷评估 |\n\n### 7.2 核心算法模型\n\n针对上述数据，心图 PsyTwin AI 采用以下算法体系进行深度解析：\n\n| 算法模块 | 技术方案 | 核心功能 |\n| :------ | :------ | :------ |\n| **面部与眼动分析** | CNN-Transformer 混合架构 + OpenFace | 识别 7 种基本情绪，提取面部动作单元(AU)，分析注意力分配与回避行为 |\n| **语音情感识别 (SER)** | Wav2Vec 2.0 预训练模型 | 提取声学向量，捕捉焦虑、抑郁、愤怒等情感维度 |\n| **生理信号处理** | HRV 时域(SDNN, RMSSD)与频域(LF/HF)分析 | 评估自主神经系统平衡状态，实时量化心理压力 |\n| **多模态融合策略** | 加权后期融合(Late Fusion) + LSTM/GRU 时序分析 | 动态权重分配，时序关联分析，确保识别结果鲁棒性 |\n\n### 7.3 心图 PsyTwin-Brain：专业大语言模型\n\n在理解层，我们部署了针对心理健康领域优化的 LLM：\n\n- **知识增强 (RAG)**：通过检索增强生成技术，将标准的心理咨询指南、CBT 疗法手册及校园心理案例库接入模型，确保 AI 的回复具备专业医学背景，而非通用的“幻觉”回复。\n- **共情对话引擎**：采用 **SFT（监督微调）** 技术，使 AI 能够识别用户话语中的“冰山底层”情绪，提供非指令性的、支持性的共情反馈。\n\n### 7.4 隐私与伦理计算\n\n- **脱敏处理**：所有视觉与语音数据在本地端进行特征提取，仅上传加密后的特征向量（Embedding）至云端，不存储原始音视频。\n- **算法透明度**：干预方案	\N	13	{"total": 15, "position": 13}	2026-03-08 07:41:47.786	2026-03-08 07:41:47.786
371a40c9-1c40-469f-a3e1-b86616ac4e21	ebb0fd53-35a4-4814-9527-c94048be3a74	步闭环破局方案\n\n**心图 PsyTwin** 筛选出最具针对性的前沿技术，构建了"**沉浸造境-深度捕捉-数字孪生-具身疗愈**"的四步闭环体系。以下为系统的核心解决逻辑与技术接力赛映射：\n\n| <div style="width: 60px">**步骤**</div> | <div style="width: 80px">**破局痛点**</div> | **硬核技术**                                                                                           | **应用预期效果**                                                                    |     |\n| :------------------------------------ | :-------------------------------------- | :------------------------------------------------------------------------------------------------- | :---------------------------------------------------------------------------- | --- |\n| _**沉浸造境**_                            | "感知扁平化"                                 | **VR沉浸交互场景构建技术**：摒弃传统量表，利用低多边形技术（Low-Poly）构建带有心理投射意味的 VR 游戏化场景，以游戏机制吸引学生                           | **沉浸参与，扩大覆盖**：将"被动填表"转变为"主动探索"，显著提升心理筛查的覆盖率，让学生沉浸其中暴露深层心理信息                   |     |\n| _**深度捕捉**_                            | "结果失真化"                                 | **游戏化隐	\N	2	{"total": 15, "position": 2}	2026-03-08 07:41:47.79	2026-03-08 07:41:47.79
cf83230b-f466-47e7-85df-e9cbeeb36efa	ebb0fd53-35a4-4814-9527-c94048be3a74	                      | **沉浸参与，扩大覆盖**：将"被动填表"转变为"主动探索"，显著提升心理筛查的覆盖率，让学生沉浸其中暴露深层心理信息                   |     |\n| _**深度捕捉**_                            | "结果失真化"                                 | **游戏化隐藏量表、深层次无感捕捉多模态数据**：在 VR 游戏交互中隐蔽嵌入专业心理量表，不依赖主观填写，而是同步抓取眼动轨迹、微表情及生理数据等"暗数据"                    | **破解伪装，精准识人**：异构数据交叉验证，有效击破学生的防御壁垒，识别准确率较传统量表提升 40% 以上                        |     |\n| _**数字孪生**_                            | "数据孤岛化"                                 | **多模态数据流处理与校园心理健康数字孪生系统前后端联通**：利用边缘计算网关与 Go 语言构建 PsyTwin Sentinel 指挥中心，配合 Pocket 小程序，实现全域多模态数据秒级互通 | **主动防御，预警溯源**：实现从"人找事"到"事找人"的数字化跨越，提供完整的数字孪生档案与预警溯源链条                         |     |\n| _**具身疗愈**_                            | "求助壁垒化"                                 | **AI智能体构建与具身智能AI硬件实体线下部署**：部署AI实体硬件舱（机器人/全息舱）在线下提供面对面语音交互与触觉反馈，结合大模型RAG技术实现专业陪伴                    | **脱虚向实、身心兼顾**：AI 实体承担 80% 基础疏导，将人工资源留给高危个体；规避纯 VR 带来的"现实脱离"风险，让学生在真实社交场景中重建信心 |     |\n\n\n\n\n### 1.3 核心架构：1+3 闭环体系\n\n项目构建了「沉浸造境-深度捕捉-数字孪生-具身疗愈」的全流程体系：\n\n**核心架构示意图：**\n\n!	\N	3	{"total": 15, "position": 3}	2026-03-08 07:41:47.798	2026-03-08 07:41:47.798
ae6b4648-7b06-45b3-9d87-483ad7acd548	ebb0fd53-35a4-4814-9527-c94048be3a74	合大模型RAG技术实现专业陪伴                    | **脱虚向实、身心兼顾**：AI 实体承担 80% 基础疏导，将人工资源留给高危个体；规避纯 VR 带来的"现实脱离"风险，让学生在真实社交场景中重建信心 |     |\n\n\n\n\n### 1.3 核心架构：1+3 闭环体系\n\n项目构建了「沉浸造境-深度捕捉-数字孪生-具身疗愈」的全流程体系：\n\n**核心架构示意图：**\n\n![[IMG-20260302185549128.png]]\n- **1 个核心（心图 PsyTwin AI）**：多模态情感计算引擎。作为系统的"大脑"，负责融合分析视觉、语音、生理、脑电等异构数据，输出心理画像。\n- **3 个终端（应用场景）**：\n    - **心图 PsyTwin VR（沉浸感知端）**：利用 Pico 4 Enterprise + BrainCo 脑电设备，提供沉浸式心理感知与筛查。通过游戏化剧本体验，在分支选择中无感获取学生深层心理数据。注：本方案不做 VR 干预，避免学生沉溺虚拟环境。\n    - **心图 PsyTwin Sentinel（数字孪生端）**：为辅导员与心理老师提供数字化看板，实现风险个体的秒级预警与资源调度。\n    - **心图 PsyTwin Pocket（便捷服务端）**：通过微信小程序提供 7×24h 的 AI 共情对话与日常心情监测，填补专业咨询之外的空白。\n\n\n---\n\n## 2. 项目优势与创新点\n\n| 创新维度 | 核心要点 | 具体描述 |\n| :------ | :------ | :------ |\n| **测评模式创新** | 从"被动填报"到"无感感知" | 隐蔽性测评：通过"星际面试"、"能量格斗"等 VR 游戏化场景，将专业心理量表（LSAS、PHQ-9）巧妙隐藏在交互任务中；破解防御心理：有效解决学生的"社会期望偏差"和抵触情绪 |\n| **技术融合创新** | 多模态情感计算与生理反馈深度耦合 | 全维度数据采集：融合微表情、语音语调、眼动轨迹及 HRV、GSR 等生理指标；高精度识别：多模态融合算法提升情绪识别准确率 40% 以上 |\n| **干预手段创新** | AI 实体硬件舱线下疗愈与 AI 共情协同 | 安全受控的线下疗愈：AI 实体硬件舱（机器人/全息舱）提供面对面语音交互与触觉	\N	4	{"total": 15, "position": 4}	2026-03-08 07:41:47.801	2026-03-08 07:41:47.801
bd1bcad6-f546-4bb5-b52f-39134afcf57e	ebb0fd53-35a4-4814-9527-c94048be3a74	的"社会期望偏差"和抵触情绪 |\n| **技术融合创新** | 多模态情感计算与生理反馈深度耦合 | 全维度数据采集：融合微表情、语音语调、眼动轨迹及 HRV、GSR 等生理指标；高精度识别：多模态融合算法提升情绪识别准确率 40% 以上 |\n| **干预手段创新** | AI 实体硬件舱线下疗愈与 AI 共情协同 | 安全受控的线下疗愈：AI 实体硬件舱（机器人/全息舱）提供面对面语音交互与触觉反馈，结合 CBT 疗法进行脱敏训练；24/7 即时支持：AI 共情对话引擎弥补人工咨询师局限，实现"预防-干预-随访"无缝衔接 |\n| **管理模式创新** | 基于大数据的"主动预防"体系 | 精准预警：大数据分析实现从"人找事"到"事找人"，自动识别高风险群体并推送预警；全生命周期档案：建立从入学到毕业的动态心理数字孪生档案 |\n| **社会价值与合规性** | 响应政策要求与隐私保护 | 响应政策：深度契合国家关于加强学生心理健康工作的专项行动计划；隐私保护：采用国密级加密技术，严守学生心理隐私底线 |\n\n---\n\n## 3. 技能大赛展示方案：四角色全链路串联\n\n本项目为**世界职业院校技能大赛**准备，采用四人团队协作展示方案。每位成员负责一个核心技术模块，展示时间 10 分钟以上，总计 40 分钟以上。通过"一名学生走进心理咨询室，穿戴设备进入 VR 场景"的故事情境，串联从场景构建、数据采集、前端交互到 AI 大脑决策的完整技术闭环。\n\n### 3.1 团队分工与技能展示\n\n| <div style="width: 110px">**工种 职业身份**</div> | <div style="width: 100px">**角色定位<br><br>对应步骤<br><br>破局痛点**</div> | **核心技能展示**                                                                                                                                                                    |\n| :------------------------------------------ | :--------	\N	5	{"total": 15, "position": 5}	2026-03-08 07:41:47.805	2026-03-08 07:41:47.805
20bd830d-8ed0-42d3-99d0-66a87c738c4b	ebb0fd53-35a4-4814-9527-c94048be3a74	                                                                                                                                             |\n| :------------------------------------------ | :--------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |\n| **3D 动画与场景建模师**                             | _造梦_<br><br>**_沉浸造境_**<br><br>**感知扁平化**                          | **【场景速建与引擎优化】**<br><br>1. 现场使用 Maya 进行心理投射场景建模。<br>2. 演示材质烘焙与光影渲染技术。<br>3. 导入 Unity 引擎完成骨骼绑定，确保 VR 端稳定 90 帧运行。                                                                |\n| **XR 交互开发工程师**                              | _捕手_<br><br>**_深度捕捉_**<br><br>**结果失真化**                          | **【隐蔽埋点与数据抓取】**<br><br>1. 现场手敲 Unity C# 交互核心脚本。<br>2. 演示调用底层 SDK，在设定的压力场景下实时抓取体验者的眼动轨迹（注视点）、视线躲闪频率及手柄微震颤数据。<br>3. 将抓取的“暗数据”通过 WebSocket 序列化打包发出。                	\N	6	{"total": 15, "position": 6}	2026-03-08 07:41:47.809	2026-03-08 07:41:47.809
9a886859-dbcd-403a-ac57-d4d5c6976a93	ebb0fd53-35a4-4814-9527-c94048be3a74	br>**结果失真化**                          | **【隐蔽埋点与数据抓取】**<br><br>1. 现场手敲 Unity C# 交互核心脚本。<br>2. 演示调用底层 SDK，在设定的压力场景下实时抓取体验者的眼动轨迹（注视点）、视线躲闪频率及手柄微震颤数据。<br>3. 将抓取的“暗数据”通过 WebSocket 序列化打包发出。                              |\n| **物联网与全栈开发工程师**                             | _哨兵_<br><br>**_数字孪生_**<br><br>**数据孤岛化**                          | **【边缘路由与高并发调度】**<br><br>1. 现场通过 Linux CLI 配置树莓派边缘计算网关，实时接收 VR 与手环生理数据。<br>2. 演示基于 Go 语言的后台高并发数据流清洗与对齐。<br>3. 对接PsyTwin Sentinel和PsyTwin Pocket微信小程序，展示系统如何联通数据，并发出“红/橙色秒级预警”。 |\n| **具身智能与 AI 编排工程师**                          | _赋灵_<br><br>**_具身疗愈_**<br><br>**求助壁垒化**                          | **【大模型微调与硬件联动】**<br><br>1. 现场演示本地大模型工作流编排与 Prompt 链式设计。<br>2. 演示 RAG 向量库管理，构建专属知识库。<br>3. 展示物理桌面 AI 实体接收到高心率警报后，触发具身智能干预，现场发出温和的语音疏导。                                         |\n\n### 3.2 展示方案核心优势\n\n| <div style="width:90px">**核心优势**</div> | 说明                                                          |\n| :------------------------------------- | :----------------------------------	\N	7	{"total": 15, "position": 7}	2026-03-08 07:41:47.813	2026-03-08 07:41:47.813
90616477-6f35-4f5d-9cee-6c6d9e3fd8f7	ebb0fd53-35a4-4814-9527-c94048be3a74	## 3.2 展示方案核心优势\n\n| <div style="width:90px">**核心优势**</div> | 说明                                                          |\n| :------------------------------------- | :---------------------------------------------------------- |\n| **个人技能突出**                             | 每个角色清晰展示硬核技术（建模、写脚本、配服务器、调大模型），充分体现单兵作战的专业能力。               |\n| **团队工程协同**                             | 四人紧密配合，上一个人的输出作为下一个人的输入，完美展示复杂系统的完整集成与协同开发能力。               |\n| **故事线完整**                              | 从学生进入心理咨询室开始，到最终 AI 实体干预结束，构建了一个具有戏剧张力和极强代入感的完整业务闭环，逻辑清晰流畅。 |\n| **符合评分标准**                             | 团队成员既各司其职又紧密咬合，充分响应“世界职业院校技能大赛”对实操硬核度与团队协作度的高分要求。           |\n\n---\n\n## 4. PsyTwin VR：沉浸感知与筛查\n\n### 4.1 技术架构\n\n心图 PsyTwin VR 采用高精度虚拟现实技术，为学生提供安全、可控的心理感知与筛查环境。\n\n- **硬件支持**：\n  - VR 头显：适配主流 6DoF VR 头显（如 Pico 4 Enterprise）\n  - 生理监测：小米手环（心率 HRV、皮肤电 GSR）\n  - 脑电检测：BrainCo 脑科学检测设备（补充脑电 EEG 数据，强化多模态数据来源）\n- **交互逻辑**：支持手势识别、面部追踪、眼动追踪及生物反馈数据接入。\n\n### 4.2 感知环节：游戏剧本体验（前期筛查）\n\n作为传统心理问卷的平行替代方案，学生可选择通过 VR 游戏剧本体验进行心理筛查。该环节利用 **Gemini 	\N	8	{"total": 15, "position": 8}	2026-03-08 07:41:47.815	2026-03-08 07:41:47.815
e62170fe-43f7-47be-ad2d-91a541856d93	ebb0fd53-35a4-4814-9527-c94048be3a74	\n  - 生理监测：小米手环（心率 HRV、皮肤电 GSR）\n  - 脑电检测：BrainCo 脑科学检测设备（补充脑电 EEG 数据，强化多模态数据来源）\n- **交互逻辑**：支持手势识别、面部追踪、眼动追踪及生物反馈数据接入。\n\n### 4.2 感知环节：游戏剧本体验（前期筛查）\n\n作为传统心理问卷的平行替代方案，学生可选择通过 VR 游戏剧本体验进行心理筛查。该环节利用 **Gemini AI** 生成游戏剧本，将专业心理量表隐藏在分支剧情选择中，让学生在沉浸式体验中暴露真实心理特征。\n![[IMG-20260302185549738.png]]\n\n| 游戏剧本 | 隐藏量表 | 核心机制 | 数据采集 |\n| :------ | :------ | :------ | :------ |\n| **【人生分岔路】**：大学生涯关键决策场景，记录学生在理想与现实、冒险与保守等抉择中的行为模式 | SDS 抑郁量表、SAS 焦虑量表 | 分支叙事、决策时间分析 | 眼动、决策延迟、脑电 |\n| **【宿舍罗生门】**：宿舍矛盾情景模拟，测试学生在人际冲突中的应对方式 | SSRS 社会支持量表、UCLA 孤独感量表 | 角色扮演、对话选择 | 语音情感、面部微表情、脑电 |\n| **【未来迷雾】**：职业规划与人生目标探索，呈现多重人生路径选择 | 职业兴趣量表、自我效能感量表 | 开放世界探索、价值观选择 | 行为轨迹、停留时间、脑电 |\n\n\n\n\n---\n---\n## 5. PsyTwin Sentinel：数字孪生系统\n\n### 5.1 数字化指挥中心 (Digital Twin Sentinel)\n**心图 PsyTwin Sentinel 是整个生态系统的数字孪生平台与决策中枢。它通过高性能的 **Go** 后端处理来自 VR 端和移动端的多模态数据流，利用 **Vue 3** 构建专业级可视化看板，实现校园心理健康状态的“一屏通览”与“主动防御”。\n\n### 5.2 核心功能模块\n\n#### **3.2.1 全域态势指挥中心 (Global Decision Dashboard)**\n- **实时预警雷达**：利用 **WebSocket** 技术接收来自 [[PsyTwin-VR]] 的异常信号。当学生在虚拟场景中出现心率激增、语音颤抖或微表情极度焦	\N	9	{"total": 15, "position": 9}	2026-03-08 07:41:47.818	2026-03-08 07:41:47.818
69539450-ff2d-4b6a-be2e-8a534855d585	ebb0fd53-35a4-4814-9527-c94048be3a74	*Vue 3** 构建专业级可视化看板，实现校园心理健康状态的“一屏通览”与“主动防御”。\n\n### 5.2 核心功能模块\n\n#### **3.2.1 全域态势指挥中心 (Global Decision Dashboard)**\n- **实时预警雷达**：利用 **WebSocket** 技术接收来自 [[PsyTwin-VR]] 的异常信号。当学生在虚拟场景中出现心率激增、语音颤抖或微表情极度焦虑时，系统实现秒级红/橙色报警。\n- **心理热力分布图**：基于 **ECharts** 动态展示各院系、年级及不同性格类型（如 MBTI）学生的心理健康分布，精准识别高压力群体聚集点。\n- **干预转化率监控**：实时追踪“发现风险—下达干预—康复闭环”的全流程效率，确保每一例预警都有迹可循、有案可查。\n\n#### **3.2.2 风险预警与溯源中心 (Alert & Traceability)**\n- **多模态证据链查看**：咨询师可调取 AI 判定的详细依据，包括 VR 交互中的语音情感曲线、面部特征点分布及生理参数（心率/压力值）的同步变化。\n- **动态风险降级逻辑**：根据干预后的随访数据与再次测评结果，AI 自动评估风险等级并建议是否取消预警，实现动态、科学的风险管控。\n![[IMG-20260302185550254.png]]\n#### **3.2.3 学生“心理孪生”档案 (Digital Twin Profiles)**\n- **全生命周期追踪**：为每位学生建立从入校到毕业的数字化心理档案，整合 MBTI 测评、VR 场景表现（逆商、抗压能力）及日常心情趋势。\n- **性格与能力雷达**：通过多维度数据建模，生成直观的心理素质雷达图，辅助辅导员进行针对性的职业规划与心理引导。\n![[IMG-20260302185550344.png]]\n#### **3.2.4 Qwen 智能配置与 RAG 知识库**\n- **RAG 向量库管理**：支持上传 PDF/Markdown 格式的专业心理咨询手册。**Qwen (通义千问)** 大模型通过检索增强生成（RAG）技术，为咨询师提供具备专业医学背景的干预建议。\n- **场景化 Prompt 策略**：针对不同的 VR 场景（如职场面试、压力释放）配置特定的 AI 人格设定与对话逻辑。\n![[IMG-20	\N	10	{"total": 15, "position": 10}	2026-03-08 07:41:47.822	2026-03-08 07:41:47.822
d2fddd28-3497-4c0c-9a2e-45b4c8930ed7	ebb0fd53-35a4-4814-9527-c94048be3a74	.2.4 Qwen 智能配置与 RAG 知识库**\n- **RAG 向量库管理**：支持上传 PDF/Markdown 格式的专业心理咨询手册。**Qwen (通义千问)** 大模型通过检索增强生成（RAG）技术，为咨询师提供具备专业医学背景的干预建议。\n- **场景化 Prompt 策略**：针对不同的 VR 场景（如职场面试、压力释放）配置特定的 AI 人格设定与对话逻辑。\n![[IMG-20260302185550641.png]]\n### 5.3 技术架构与安全规范\n\n| 维度 | 技术实现 |\n| :--- | :--- |\n| **后端架构** | Go 1.22+ (Gin Framework) 实现高并发多模态数据处理 |\n| **前端框架** | Vue 3 (Composition API) + Element Plus + ECharts |\n| **AI 引擎** | Qwen-7B/14B 本地化部署 + LangChainGo 架构 |\n| **数据安全** | 采用非对称加密技术；支持一键脱敏预览，严守隐私伦理 |\n| **信创适配** | 适配国产操作系统（如麒麟、统信）及国产数据库，符合自主可控要求 |\n\n---\n---\n\n## 6. PsyTwin Pocket：微信小程序\n\n### 6.1 产品定位\n\n**心图 PsyTwin Pocket**是整个生态系统的移动端入口，定位为**轻量化、高频互动的心理健康陪伴工具**。\n\n产品的核心价值在于「去标签化」**：让心理监测看起来像日常社交，让求助过程自然无压力。同时为辅导员提供移动端的预警响应与班级管理能力，实现从「手机端初步筛查」到「AI 实体硬件舱线下疗愈」的完整服务闭环。\n\n### 6.2 双端架构与功能\n\nPsyTwin Pocket 采用**学生端 + 教师端**双角色设计，通过统一的登录流程区分身份，登录后自动加载对应角色的 TabBar。\n\n| 角色 | 心友圈 | AI 对话 | 第三 Tab | 我的 |\n|------|--------|---------|----------|------|\n| **学生** | 瀑布流社区、发布、点赞评论 | 7×24h AI 陪伴、情绪标签、CBT卡片 | 心理咨询/VR/团体预约 | 档案、测评、收藏、设置 |\n| **	\N	11	{"total": 15, "position": 11}	2026-03-08 07:41:47.829	2026-03-08 07:41:47.829
cbee0f66-0171-4ba4-9b3c-0d2d47427169	ebb0fd53-35a4-4814-9527-c94048be3a74	统一的登录流程区分身份，登录后自动加载对应角色的 TabBar。\n\n| 角色 | 心友圈 | AI 对话 | 第三 Tab | 我的 |\n|------|--------|---------|----------|------|\n| **学生** | 瀑布流社区、发布、点赞评论 | 7×24h AI 陪伴、情绪标签、CBT卡片 | 心理咨询/VR/团体预约 | 档案、测评、收藏、设置 |\n| **教师** | 浏览校园动态 | 查看对话记录、辅助干预 | 工作台：统计图表、预警列表 | 教师徽章、排班、设置 |\n\n- **学生端特色**：无感情绪监测（规划中）\n- **教师端特色**：预警级别（低/中/高风险）\n\n### 6.3 技术实现\n\n- **框架**：微信小程序 + TDesign Mini Program v1.11.2\n- **语言**：JavaScript\n- **样式**：LESS\n- **Mock 数据系统**：支持离线开发，模拟真实 API 响应\n\n\n## 7. PsyTwin AI：多模态情感计算\n\n### 7.1 多模态数据采集架构 (Data Acquisition)\n\n基于现有硬件链路，系统实时采集以下五类核心数据流：\n\n| 数据流类型 | 硬件设备 | 采集内容 | 应用场景 |\n| :-------- | :------ | :------ | :------ |\n| **视觉流 (Visual)** | 外部摄像机 + Pico 4 Enterprise 内置相机 | 面部微表情(FER)、肢体姿态、眼动轨迹(Gaze Tracking)、瞳孔变化 | 识别焦虑、抑郁、社交回避等情绪特征 |\n| **语音流 (Audio)** | VR 头显麦克风 | 声学特征(音调、能量、语速)、语义内容 | 语音情感识别(SER)、语义分析 |\n| **生理流 (Physiological)** | 小米手环 | 心率(HR)、心率变异性(HRV)、压力指数 | 实时量化心理压力、评估自主神经系统状态 |\n| **交互流 (Interaction)** | Pico 4 6DoF 手柄/手势识别 | 操作频率、手部震颤、反应时 | 行为模式分析、焦虑/愤怒检测 |\n| **脑电流 (EEG)** | BrainCo 脑科学检测设备 | Alph	\N	12	{"total": 15, "position": 12}	2026-03-08 07:41:47.832	2026-03-08 07:41:47.832
84d2193d-a5ab-49f0-a3f3-fe5c6b23fd97	ebb0fd53-35a4-4814-9527-c94048be3a74	*生理流 (Physiological)** | 小米手环 | 心率(HR)、心率变异性(HRV)、压力指数 | 实时量化心理压力、评估自主神经系统状态 |\n| **交互流 (Interaction)** | Pico 4 6DoF 手柄/手势识别 | 操作频率、手部震颤、反应时 | 行为模式分析、焦虑/愤怒检测 |\n| **脑电流 (EEG)** | BrainCo 脑科学检测设备 | Alpha波(放松度)、Beta波(焦虑度)、Theta波(抑郁倾向) | 深层心理特征捕捉、认知负荷评估 |\n\n### 7.2 核心算法模型\n\n针对上述数据，心图 PsyTwin AI 采用以下算法体系进行深度解析：\n\n| 算法模块 | 技术方案 | 核心功能 |\n| :------ | :------ | :------ |\n| **面部与眼动分析** | CNN-Transformer 混合架构 + OpenFace | 识别 7 种基本情绪，提取面部动作单元(AU)，分析注意力分配与回避行为 |\n| **语音情感识别 (SER)** | Wav2Vec 2.0 预训练模型 | 提取声学向量，捕捉焦虑、抑郁、愤怒等情感维度 |\n| **生理信号处理** | HRV 时域(SDNN, RMSSD)与频域(LF/HF)分析 | 评估自主神经系统平衡状态，实时量化心理压力 |\n| **多模态融合策略** | 加权后期融合(Late Fusion) + LSTM/GRU 时序分析 | 动态权重分配，时序关联分析，确保识别结果鲁棒性 |\n\n### 7.3 心图 PsyTwin-Brain：专业大语言模型\n\n在理解层，我们部署了针对心理健康领域优化的 LLM：\n\n- **知识增强 (RAG)**：通过检索增强生成技术，将标准的心理咨询指南、CBT 疗法手册及校园心理案例库接入模型，确保 AI 的回复具备专业医学背景，而非通用的“幻觉”回复。\n- **共情对话引擎**：采用 **SFT（监督微调）** 技术，使 AI 能够识别用户话语中的“冰山底层”情绪，提供非指令性的、支持性的共情反馈。\n\n### 7.4 隐私与伦理计算\n\n- **脱敏处理**：所有视觉与语音数据在本地端进行特征提取，仅上传加密后的特征向量（Embedding）至云端，不存储原始音视频。\n- **算法透明度**：干预方案	\N	13	{"total": 15, "position": 13}	2026-03-08 07:41:47.835	2026-03-08 07:41:47.835
8106c4ff-344b-40be-8753-10c0c626c5af	ebb0fd53-35a4-4814-9527-c94048be3a74	回复具备专业医学背景，而非通用的“幻觉”回复。\n- **共情对话引擎**：采用 **SFT（监督微调）** 技术，使 AI 能够识别用户话语中的“冰山底层”情绪，提供非指令性的、支持性的共情反馈。\n\n### 7.4 隐私与伦理计算\n\n- **脱敏处理**：所有视觉与语音数据在本地端进行特征提取，仅上传加密后的特征向量（Embedding）至云端，不存储原始音视频。\n- **算法透明度**：干预方案的生成过程包含”可解释性”模块，向心理老师展示 AI 判定高风险的依据（如：心率异常波动 + 语义消极倾向）。\n\n---\n\n**注**：本文件由 [[PsyTwin-项目总说明]]\n\n	\N	14	{"total": 15, "position": 14}	2026-03-08 07:41:47.838	2026-03-08 07:41:47.838
\.


--
-- Data for Name: expression_data; Type: TABLE DATA; Schema: public; Owner: psytwin
--

COPY public.expression_data (id, student_id, "timestamp", primary_expression, anxiety_level, sadness_level, anger_level, created_at, updated_at) FROM stdin;
ed-stu-zhangyu-0	stu-zhangyu	2026-03-07 09:23:47.475	微笑	0.1	0.05	0.02	2026-03-06 14:38:40.828	2026-03-07 09:23:47.71
ed-stu-zhangyu-1	stu-zhangyu	2026-03-07 09:22:47.475	皱眉	0.16	0.08	0.03	2026-03-06 14:38:40.834	2026-03-07 09:23:47.716
ed-stu-zhangyu-2	stu-zhangyu	2026-03-07 09:21:47.475	微笑	0.22	0.11	0.04	2026-03-06 14:38:40.839	2026-03-07 09:23:47.721
ed-stu-zhangyu-3	stu-zhangyu	2026-03-07 09:20:47.475	皱眉	0.28	0.14	0.05	2026-03-06 14:38:40.845	2026-03-07 09:23:47.726
ed-stu-zhangyu-4	stu-zhangyu	2026-03-07 09:19:47.475	微笑	0.34	0.17	0.06	2026-03-06 14:38:40.85	2026-03-07 09:23:47.73
ed-stu-zhangyu-5	stu-zhangyu	2026-03-07 09:18:47.475	皱眉	0.4	0.2	0.07	2026-03-06 14:38:40.855	2026-03-07 09:23:47.735
ed-stu-liusiyuan-0	stu-liusiyuan	2026-03-07 09:17:47.475	微笑	0.1	0.05	0.02	2026-03-06 14:38:40.86	2026-03-07 09:23:47.739
ed-stu-liusiyuan-1	stu-liusiyuan	2026-03-07 09:16:47.475	皱眉	0.16	0.08	0.03	2026-03-06 14:38:40.864	2026-03-07 09:23:47.744
ed-stu-liusiyuan-2	stu-liusiyuan	2026-03-07 09:15:47.475	微笑	0.22	0.11	0.04	2026-03-06 14:38:40.869	2026-03-07 09:23:47.748
ed-stu-liusiyuan-3	stu-liusiyuan	2026-03-07 09:14:47.475	皱眉	0.28	0.14	0.05	2026-03-06 14:38:40.873	2026-03-07 09:23:47.753
ed-stu-liusiyuan-4	stu-liusiyuan	2026-03-07 09:13:47.475	微笑	0.34	0.17	0.06	2026-03-06 14:38:40.878	2026-03-07 09:23:47.757
ed-stu-liusiyuan-5	stu-liusiyuan	2026-03-07 09:12:47.475	皱眉	0.4	0.2	0.07	2026-03-06 14:38:40.883	2026-03-07 09:23:47.761
ed-stu-chenyuqing-0	stu-chenyuqing	2026-03-07 09:11:47.475	微笑	0.1	0.05	0.02	2026-03-06 14:38:40.888	2026-03-07 09:23:47.766
ed-stu-chenyuqing-1	stu-chenyuqing	2026-03-07 09:10:47.475	皱眉	0.16	0.08	0.03	2026-03-06 14:38:40.892	2026-03-07 09:23:47.771
ed-stu-chenyuqing-2	stu-chenyuqing	2026-03-07 09:09:47.475	微笑	0.22	0.11	0.04	2026-03-06 14:38:40.897	2026-03-07 09:23:47.775
ed-stu-chenyuqing-3	stu-chenyuqing	2026-03-07 09:08:47.475	皱眉	0.28	0.14	0.05	2026-03-06 14:38:40.902	2026-03-07 09:23:47.779
ed-stu-chenyuqing-4	stu-chenyuqing	2026-03-07 09:07:47.475	微笑	0.34	0.17	0.06	2026-03-06 14:38:40.907	2026-03-07 09:23:47.784
ed-stu-chenyuqing-5	stu-chenyuqing	2026-03-07 09:06:47.475	皱眉	0.4	0.2	0.07	2026-03-06 14:38:40.912	2026-03-07 09:23:47.788
ed-stu-zhangmingyuan-0	stu-zhangmingyuan	2026-03-07 09:05:47.475	微笑	0.1	0.05	0.02	2026-03-06 14:38:40.917	2026-03-07 09:23:47.792
ed-stu-zhangmingyuan-1	stu-zhangmingyuan	2026-03-07 09:04:47.475	皱眉	0.16	0.08	0.03	2026-03-06 14:38:40.922	2026-03-07 09:23:47.797
ed-stu-zhangmingyuan-2	stu-zhangmingyuan	2026-03-07 09:03:47.475	微笑	0.22	0.11	0.04	2026-03-06 14:38:40.928	2026-03-07 09:23:47.802
ed-stu-zhangmingyuan-3	stu-zhangmingyuan	2026-03-07 09:02:47.475	皱眉	0.28	0.14	0.05	2026-03-06 14:38:40.932	2026-03-07 09:23:47.806
ed-stu-zhangmingyuan-4	stu-zhangmingyuan	2026-03-07 09:01:47.475	微笑	0.34	0.17	0.06	2026-03-06 14:38:40.937	2026-03-07 09:23:47.81
ed-stu-zhangmingyuan-5	stu-zhangmingyuan	2026-03-07 09:00:47.475	皱眉	0.4	0.2	0.07	2026-03-06 14:38:40.943	2026-03-07 09:23:47.816
ed-stu-wuzhiyuan-0	stu-wuzhiyuan	2026-03-07 08:59:47.475	微笑	0.1	0.05	0.02	2026-03-06 14:38:40.95	2026-03-07 09:23:47.82
ed-stu-wuzhiyuan-1	stu-wuzhiyuan	2026-03-07 08:58:47.475	皱眉	0.16	0.08	0.03	2026-03-06 14:38:40.955	2026-03-07 09:23:47.825
ed-stu-wuzhiyuan-2	stu-wuzhiyuan	2026-03-07 08:57:47.475	微笑	0.22	0.11	0.04	2026-03-06 14:38:40.96	2026-03-07 09:23:47.83
ed-stu-wuzhiyuan-3	stu-wuzhiyuan	2026-03-07 08:56:47.475	皱眉	0.28	0.14	0.05	2026-03-06 14:38:40.966	2026-03-07 09:23:47.835
ed-stu-wuzhiyuan-4	stu-wuzhiyuan	2026-03-07 08:55:47.475	微笑	0.34	0.17	0.06	2026-03-06 14:38:40.97	2026-03-07 09:23:47.839
ed-stu-wuzhiyuan-5	stu-wuzhiyuan	2026-03-07 08:54:47.475	皱眉	0.4	0.2	0.07	2026-03-06 14:38:40.976	2026-03-07 09:23:47.844
ed-stu-zhouhangyu-0	stu-zhouhangyu	2026-03-07 08:53:47.475	微笑	0.1	0.05	0.02	2026-03-06 14:38:40.98	2026-03-07 09:23:47.848
ed-stu-zhouhangyu-1	stu-zhouhangyu	2026-03-07 08:52:47.475	皱眉	0.16	0.08	0.03	2026-03-06 14:38:40.987	2026-03-07 09:23:47.853
ed-stu-zhouhangyu-2	stu-zhouhangyu	2026-03-07 08:51:47.475	微笑	0.22	0.11	0.04	2026-03-06 14:38:40.991	2026-03-07 09:23:47.857
ed-stu-zhouhangyu-3	stu-zhouhangyu	2026-03-07 08:50:47.475	皱眉	0.28	0.14	0.05	2026-03-06 14:38:40.996	2026-03-07 09:23:47.861
ed-stu-zhouhangyu-4	stu-zhouhangyu	2026-03-07 08:49:47.475	微笑	0.34	0.17	0.06	2026-03-06 14:38:41.001	2026-03-07 09:23:47.865
ed-stu-zhouhangyu-5	stu-zhouhangyu	2026-03-07 08:48:47.475	皱眉	0.4	0.2	0.07	2026-03-06 14:38:41.006	2026-03-07 09:23:47.87
ed-stu-zhaotianyu-0	stu-zhaotianyu	2026-03-07 08:47:47.475	微笑	0.1	0.05	0.02	2026-03-06 14:38:41.01	2026-03-07 09:23:47.874
ed-stu-zhaotianyu-1	stu-zhaotianyu	2026-03-07 08:46:47.475	皱眉	0.16	0.08	0.03	2026-03-06 14:38:41.015	2026-03-07 09:23:47.88
ed-stu-zhaotianyu-2	stu-zhaotianyu	2026-03-07 08:45:47.475	微笑	0.22	0.11	0.04	2026-03-06 14:38:41.019	2026-03-07 09:23:47.884
ed-stu-zhaotianyu-3	stu-zhaotianyu	2026-03-07 08:44:47.475	皱眉	0.28	0.14	0.05	2026-03-06 14:38:41.024	2026-03-07 09:23:47.889
ed-stu-zhaotianyu-4	stu-zhaotianyu	2026-03-07 08:43:47.475	微笑	0.34	0.17	0.06	2026-03-06 14:38:41.028	2026-03-07 09:23:47.893
ed-stu-zhaotianyu-5	stu-zhaotianyu	2026-03-07 08:42:47.475	皱眉	0.4	0.2	0.07	2026-03-06 14:38:41.033	2026-03-07 09:23:47.897
ed-stu-huangsimeng-0	stu-huangsimeng	2026-03-07 08:41:47.475	微笑	0.1	0.05	0.02	2026-03-06 14:38:41.037	2026-03-07 09:23:47.902
ed-stu-huangsimeng-1	stu-huangsimeng	2026-03-07 08:40:47.475	皱眉	0.16	0.08	0.03	2026-03-06 14:38:41.042	2026-03-07 09:23:47.906
ed-stu-huangsimeng-2	stu-huangsimeng	2026-03-07 08:39:47.475	微笑	0.22	0.11	0.04	2026-03-06 14:38:41.047	2026-03-07 09:23:47.91
ed-stu-huangsimeng-3	stu-huangsimeng	2026-03-07 08:38:47.475	皱眉	0.28	0.14	0.05	2026-03-06 14:38:41.051	2026-03-07 09:23:47.915
ed-stu-huangsimeng-4	stu-huangsimeng	2026-03-07 08:37:47.475	微笑	0.34	0.17	0.06	2026-03-06 14:38:41.057	2026-03-07 09:23:47.92
ed-stu-huangsimeng-5	stu-huangsimeng	2026-03-07 08:36:47.475	皱眉	0.4	0.2	0.07	2026-03-06 14:38:41.062	2026-03-07 09:23:47.925
ed-stu-linzhihao-0	stu-linzhihao	2026-03-07 08:35:47.475	微笑	0.1	0.05	0.02	2026-03-06 14:38:41.067	2026-03-07 09:23:47.929
ed-stu-linzhihao-1	stu-linzhihao	2026-03-07 08:34:47.475	皱眉	0.16	0.08	0.03	2026-03-06 14:38:41.072	2026-03-07 09:23:47.934
ed-stu-linzhihao-2	stu-linzhihao	2026-03-07 08:33:47.475	微笑	0.22	0.11	0.04	2026-03-06 14:38:41.076	2026-03-07 09:23:47.938
ed-stu-linzhihao-3	stu-linzhihao	2026-03-07 08:32:47.475	皱眉	0.28	0.14	0.05	2026-03-06 14:38:41.081	2026-03-07 09:23:47.942
ed-stu-linzhihao-4	stu-linzhihao	2026-03-07 08:31:47.475	微笑	0.34	0.17	0.06	2026-03-06 14:38:41.086	2026-03-07 09:23:47.947
ed-stu-linzhihao-5	stu-linzhihao	2026-03-07 08:30:47.475	皱眉	0.4	0.2	0.07	2026-03-06 14:38:41.09	2026-03-07 09:23:47.952
ed-stu-wangyuyan-0	stu-wangyuyan	2026-03-07 08:29:47.475	微笑	0.1	0.05	0.02	2026-03-06 14:38:41.095	2026-03-07 09:23:47.956
ed-stu-wangyuyan-1	stu-wangyuyan	2026-03-07 08:28:47.475	皱眉	0.16	0.08	0.03	2026-03-06 14:38:41.099	2026-03-07 09:23:47.96
ed-stu-wangyuyan-2	stu-wangyuyan	2026-03-07 08:27:47.475	微笑	0.22	0.11	0.04	2026-03-06 14:38:41.103	2026-03-07 09:23:47.965
ed-stu-wangyuyan-3	stu-wangyuyan	2026-03-07 08:26:47.475	皱眉	0.28	0.14	0.05	2026-03-06 14:38:41.108	2026-03-07 09:23:47.969
ed-stu-wangyuyan-4	stu-wangyuyan	2026-03-07 08:25:47.475	微笑	0.34	0.17	0.06	2026-03-06 14:38:41.112	2026-03-07 09:23:47.974
ed-stu-wangyuyan-5	stu-wangyuyan	2026-03-07 08:24:47.475	皱眉	0.4	0.2	0.07	2026-03-06 14:38:41.117	2026-03-07 09:23:47.979
\.


--
-- Data for Name: faculties; Type: TABLE DATA; Schema: public; Owner: psytwin
--

COPY public.faculties (id, name, campus_x, campus_y, stress_index, risk_level, created_at, updated_at) FROM stdin;
fac-info	信息工程学院	54.57219654727293	99.80893345609351	53	MEDIUM	2026-03-06 14:38:11.75	2026-03-07 15:35:05.777
fac-soft	软件学院	86.21172497608597	94.46278600413436	41	LOW	2026-03-06 14:38:11.755	2026-03-07 15:35:05.78
fac-dm	数字媒体学院	64.95913915189207	95.04377417460297	49	MEDIUM	2026-03-06 14:38:11.756	2026-03-07 15:35:05.782
fac-cyber	网络空间安全学院	53.78720596012083	1.198452428672681	62	HIGH	2026-03-06 14:38:11.758	2026-03-07 15:35:05.783
fac-vr	虚拟现实学院	40.97574810821943	47.56208743033947	38	LOW	2026-03-06 14:38:11.759	2026-03-07 15:35:05.785
fac-data	大数据学院	21.95060444465983	8.505515205213609	55	MEDIUM	2026-03-06 14:38:11.761	2026-03-07 15:35:05.787
\.


--
-- Data for Name: intervention_details; Type: TABLE DATA; Schema: public; Owner: psytwin
--

COPY public.intervention_details (id, record_id, pre_mood, pre_anxiety_level, pre_depression_level, pre_stress_level, main_issues, risk_level, risk_assessment, session_content, techniques_used, student_engagement, key_points, emotional_changes, post_mood, post_anxiety_level, post_depression_level, post_stress_level, improvement_score, breakthrough_points, unfinished_issues, follow_up_actions, next_appointment, referrals, recommendations, private_notes, attachments, created_at, updated_at) FROM stdin;
efbb297b-c055-4003-801b-3e6fcd8cabd3	ir-01	疲惫	6	3	4	学业压力较大，对未来职业发展感到迷茫，与室友关系需要改善。近期睡眠质量下降，注意力难以集中。	低风险	目前无自伤自杀风险，但需关注学业压力和社交适应问题。建议定期跟进，必要时转介精神科。	本次会话主要围绕学业压力展开。学生表达了对期末考试的担忧和对未来就业的不确定性。通过认知重构技术，帮助学生识别自动化负性思维，并学习用更平衡的视角看待压力情境。	{倾听与共情,开放式提问}	学生参与度较高，能够主动分享内心想法。在练习环节积极配合，对CBT技术表现出兴趣。	1. 识别了完美主义思维模式 2. 学习了呼吸放松技巧 3. 制定了逐步面对焦虑的计划	会话开始时学生情绪较为紧张，随着会谈进行逐渐放松，结束时表示感到有希望和动力。	积极	5	3	2	6	学生首次意识到自己的完美主义倾向，并表示愿意尝试用更灵活的标准要求自己。	仍需继续练习认知重构技术，并在日常生活中应用放松技巧。	1. 每日记录情绪日志 2. 坚持练习腹式呼吸 3. 下周继续面谈跟进 4. 如情况恶化及时联系	2026-03-15 06:14:43.871	目前暂不需要转介。建议继续心理咨询，如症状持续或加重，考虑转介精神科医生。	保持规律作息，适当运动，与家人朋友多沟通交流。学习接受不完美，设定现实可行的目标。	学生家庭背景：父母期望较高。需要关注其自我评价过低的问题。建议下次会谈探讨家庭关系对其影响。	{}	2026-03-08 06:14:43.873	2026-03-08 06:14:43.873
01a72bd0-db5f-4dcb-aac6-bac8c2dc5870	ir-02	烦躁	3	2	4	学业压力较大，对未来职业发展感到迷茫，与室友关系需要改善。近期睡眠质量下降，注意力难以集中。	低风险	目前无自伤自杀风险，但需关注学业压力和社交适应问题。建议定期跟进，必要时转介精神科。	本次会话主要围绕学业压力展开。学生表达了对期末考试的担忧和对未来就业的不确定性。通过认知重构技术，帮助学生识别自动化负性思维，并学习用更平衡的视角看待压力情境。	{倾听与共情,开放式提问}	学生参与度较高，能够主动分享内心想法。在练习环节积极配合，对CBT技术表现出兴趣。	1. 识别了完美主义思维模式 2. 学习了呼吸放松技巧 3. 制定了逐步面对焦虑的计划	会话开始时学生情绪较为紧张，随着会谈进行逐渐放松，结束时表示感到有希望和动力。	充满希望	1	2	3	6	学生首次意识到自己的完美主义倾向，并表示愿意尝试用更灵活的标准要求自己。	仍需继续练习认知重构技术，并在日常生活中应用放松技巧。	1. 每日记录情绪日志 2. 坚持练习腹式呼吸 3. 下周继续面谈跟进 4. 如情况恶化及时联系	2026-03-15 06:14:43.882	目前暂不需要转介。建议继续心理咨询，如症状持续或加重，考虑转介精神科医生。	保持规律作息，适当运动，与家人朋友多沟通交流。学习接受不完美，设定现实可行的目标。	学生家庭背景：父母期望较高。需要关注其自我评价过低的问题。建议下次会谈探讨家庭关系对其影响。	{}	2026-03-08 06:14:43.883	2026-03-08 06:14:43.883
4c3c8ee2-d029-41ab-a55d-a9d936abf776	ir-03	紧张	7	3	5	学业压力较大，对未来职业发展感到迷茫，与室友关系需要改善。近期睡眠质量下降，注意力难以集中。	中低风险	目前无自伤自杀风险，但需关注学业压力和社交适应问题。建议定期跟进，必要时转介精神科。	本次会话主要围绕学业压力展开。学生表达了对期末考试的担忧和对未来就业的不确定性。通过认知重构技术，帮助学生识别自动化负性思维，并学习用更平衡的视角看待压力情境。	{倾听与共情,开放式提问}	学生参与度较高，能够主动分享内心想法。在练习环节积极配合，对CBT技术表现出兴趣。	1. 识别了完美主义思维模式 2. 学习了呼吸放松技巧 3. 制定了逐步面对焦虑的计划	会话开始时学生情绪较为紧张，随着会谈进行逐渐放松，结束时表示感到有希望和动力。	积极	6	3	4	5	学生首次意识到自己的完美主义倾向，并表示愿意尝试用更灵活的标准要求自己。	仍需继续练习认知重构技术，并在日常生活中应用放松技巧。	1. 每日记录情绪日志 2. 坚持练习腹式呼吸 3. 下周继续面谈跟进 4. 如情况恶化及时联系	2026-03-15 06:14:43.886	目前暂不需要转介。建议继续心理咨询，如症状持续或加重，考虑转介精神科医生。	保持规律作息，适当运动，与家人朋友多沟通交流。学习接受不完美，设定现实可行的目标。	学生家庭背景：父母期望较高。需要关注其自我评价过低的问题。建议下次会谈探讨家庭关系对其影响。	{}	2026-03-08 06:14:43.887	2026-03-08 06:14:43.887
7a7b2586-b849-42f3-9156-d46bd15a44b9	ir-04	烦躁	3	4	4	学业压力较大，对未来职业发展感到迷茫，与室友关系需要改善。近期睡眠质量下降，注意力难以集中。	中低风险	目前无自伤自杀风险，但需关注学业压力和社交适应问题。建议定期跟进，必要时转介精神科。	本次会话主要围绕学业压力展开。学生表达了对期末考试的担忧和对未来就业的不确定性。通过认知重构技术，帮助学生识别自动化负性思维，并学习用更平衡的视角看待压力情境。	{倾听与共情,开放式提问}	学生参与度较高，能够主动分享内心想法。在练习环节积极配合，对CBT技术表现出兴趣。	1. 识别了完美主义思维模式 2. 学习了呼吸放松技巧 3. 制定了逐步面对焦虑的计划	会话开始时学生情绪较为紧张，随着会谈进行逐渐放松，结束时表示感到有希望和动力。	充满希望	1	3	2	6	学生首次意识到自己的完美主义倾向，并表示愿意尝试用更灵活的标准要求自己。	仍需继续练习认知重构技术，并在日常生活中应用放松技巧。	1. 每日记录情绪日志 2. 坚持练习腹式呼吸 3. 下周继续面谈跟进 4. 如情况恶化及时联系	2026-03-15 06:14:43.889	目前暂不需要转介。建议继续心理咨询，如症状持续或加重，考虑转介精神科医生。	保持规律作息，适当运动，与家人朋友多沟通交流。学习接受不完美，设定现实可行的目标。	学生家庭背景：父母期望较高。需要关注其自我评价过低的问题。建议下次会谈探讨家庭关系对其影响。	{}	2026-03-08 06:14:43.89	2026-03-08 06:14:43.89
86af139b-f3ce-417b-b314-99b38352075d	ir-05	焦虑	5	3	6	学业压力较大，对未来职业发展感到迷茫，与室友关系需要改善。近期睡眠质量下降，注意力难以集中。	低风险	目前无自伤自杀风险，但需关注学业压力和社交适应问题。建议定期跟进，必要时转介精神科。	本次会话主要围绕学业压力展开。学生表达了对期末考试的担忧和对未来就业的不确定性。通过认知重构技术，帮助学生识别自动化负性思维，并学习用更平衡的视角看待压力情境。	{倾听与共情,开放式提问}	学生参与度较高，能够主动分享内心想法。在练习环节积极配合，对CBT技术表现出兴趣。	1. 识别了完美主义思维模式 2. 学习了呼吸放松技巧 3. 制定了逐步面对焦虑的计划	会话开始时学生情绪较为紧张，随着会谈进行逐渐放松，结束时表示感到有希望和动力。	积极	4	3	5	5	学生首次意识到自己的完美主义倾向，并表示愿意尝试用更灵活的标准要求自己。	仍需继续练习认知重构技术，并在日常生活中应用放松技巧。	1. 每日记录情绪日志 2. 坚持练习腹式呼吸 3. 下周继续面谈跟进 4. 如情况恶化及时联系	2026-03-15 06:14:43.893	目前暂不需要转介。建议继续心理咨询，如症状持续或加重，考虑转介精神科医生。	保持规律作息，适当运动，与家人朋友多沟通交流。学习接受不完美，设定现实可行的目标。	学生家庭背景：父母期望较高。需要关注其自我评价过低的问题。建议下次会谈探讨家庭关系对其影响。	{}	2026-03-08 06:14:43.894	2026-03-08 06:14:43.894
98f16ada-bc0d-4335-89c4-cd466988ab4c	ir-06	烦躁	4	3	8	学业压力较大，对未来职业发展感到迷茫，与室友关系需要改善。近期睡眠质量下降，注意力难以集中。	中等风险	目前无自伤自杀风险，但需关注学业压力和社交适应问题。建议定期跟进，必要时转介精神科。	本次会话主要围绕学业压力展开。学生表达了对期末考试的担忧和对未来就业的不确定性。通过认知重构技术，帮助学生识别自动化负性思维，并学习用更平衡的视角看待压力情境。	{倾听与共情,开放式提问}	学生参与度较高，能够主动分享内心想法。在练习环节积极配合，对CBT技术表现出兴趣。	1. 识别了完美主义思维模式 2. 学习了呼吸放松技巧 3. 制定了逐步面对焦虑的计划	会话开始时学生情绪较为紧张，随着会谈进行逐渐放松，结束时表示感到有希望和动力。	平静	2	2	5	7	学生首次意识到自己的完美主义倾向，并表示愿意尝试用更灵活的标准要求自己。	仍需继续练习认知重构技术，并在日常生活中应用放松技巧。	1. 每日记录情绪日志 2. 坚持练习腹式呼吸 3. 下周继续面谈跟进 4. 如情况恶化及时联系	2026-03-15 06:14:43.896	目前暂不需要转介。建议继续心理咨询，如症状持续或加重，考虑转介精神科医生。	保持规律作息，适当运动，与家人朋友多沟通交流。学习接受不完美，设定现实可行的目标。	学生家庭背景：父母期望较高。需要关注其自我评价过低的问题。建议下次会谈探讨家庭关系对其影响。	{}	2026-03-08 06:14:43.897	2026-03-08 06:14:43.897
1a8b2f04-e15a-4169-a635-48dd37a1c2e1	ir-07	紧张	4	2	8	学业压力较大，对未来职业发展感到迷茫，与室友关系需要改善。近期睡眠质量下降，注意力难以集中。	低风险	目前无自伤自杀风险，但需关注学业压力和社交适应问题。建议定期跟进，必要时转介精神科。	本次会话主要围绕学业压力展开。学生表达了对期末考试的担忧和对未来就业的不确定性。通过认知重构技术，帮助学生识别自动化负性思维，并学习用更平衡的视角看待压力情境。	{倾听与共情,开放式提问}	学生参与度较高，能够主动分享内心想法。在练习环节积极配合，对CBT技术表现出兴趣。	1. 识别了完美主义思维模式 2. 学习了呼吸放松技巧 3. 制定了逐步面对焦虑的计划	会话开始时学生情绪较为紧张，随着会谈进行逐渐放松，结束时表示感到有希望和动力。	放松	2	2	5	6	学生首次意识到自己的完美主义倾向，并表示愿意尝试用更灵活的标准要求自己。	仍需继续练习认知重构技术，并在日常生活中应用放松技巧。	1. 每日记录情绪日志 2. 坚持练习腹式呼吸 3. 下周继续面谈跟进 4. 如情况恶化及时联系	2026-03-15 06:14:43.9	目前暂不需要转介。建议继续心理咨询，如症状持续或加重，考虑转介精神科医生。	保持规律作息，适当运动，与家人朋友多沟通交流。学习接受不完美，设定现实可行的目标。	学生家庭背景：父母期望较高。需要关注其自我评价过低的问题。建议下次会谈探讨家庭关系对其影响。	{}	2026-03-08 06:14:43.901	2026-03-08 06:14:43.901
80126e92-9433-48e3-96fb-62d8546b313f	ir-08	烦躁	5	6	6	学业压力较大，对未来职业发展感到迷茫，与室友关系需要改善。近期睡眠质量下降，注意力难以集中。	中等风险	目前无自伤自杀风险，但需关注学业压力和社交适应问题。建议定期跟进，必要时转介精神科。	本次会话主要围绕学业压力展开。学生表达了对期末考试的担忧和对未来就业的不确定性。通过认知重构技术，帮助学生识别自动化负性思维，并学习用更平衡的视角看待压力情境。	{倾听与共情,开放式提问}	学生参与度较高，能够主动分享内心想法。在练习环节积极配合，对CBT技术表现出兴趣。	1. 识别了完美主义思维模式 2. 学习了呼吸放松技巧 3. 制定了逐步面对焦虑的计划	会话开始时学生情绪较为紧张，随着会谈进行逐渐放松，结束时表示感到有希望和动力。	平静	4	5	3	6	学生首次意识到自己的完美主义倾向，并表示愿意尝试用更灵活的标准要求自己。	仍需继续练习认知重构技术，并在日常生活中应用放松技巧。	1. 每日记录情绪日志 2. 坚持练习腹式呼吸 3. 下周继续面谈跟进 4. 如情况恶化及时联系	2026-03-15 06:14:43.903	目前暂不需要转介。建议继续心理咨询，如症状持续或加重，考虑转介精神科医生。	保持规律作息，适当运动，与家人朋友多沟通交流。学习接受不完美，设定现实可行的目标。	学生家庭背景：父母期望较高。需要关注其自我评价过低的问题。建议下次会谈探讨家庭关系对其影响。	{}	2026-03-08 06:14:43.904	2026-03-08 06:14:43.904
b261b4ae-488a-453c-be1b-06640d5cd558	ir-09	低落	6	5	4	学业压力较大，对未来职业发展感到迷茫，与室友关系需要改善。近期睡眠质量下降，注意力难以集中。	中低风险	目前无自伤自杀风险，但需关注学业压力和社交适应问题。建议定期跟进，必要时转介精神科。	本次会话主要围绕学业压力展开。学生表达了对期末考试的担忧和对未来就业的不确定性。通过认知重构技术，帮助学生识别自动化负性思维，并学习用更平衡的视角看待压力情境。	{倾听与共情,开放式提问}	学生参与度较高，能够主动分享内心想法。在练习环节积极配合，对CBT技术表现出兴趣。	1. 识别了完美主义思维模式 2. 学习了呼吸放松技巧 3. 制定了逐步面对焦虑的计划	会话开始时学生情绪较为紧张，随着会谈进行逐渐放松，结束时表示感到有希望和动力。	充满希望	5	5	1	6	学生首次意识到自己的完美主义倾向，并表示愿意尝试用更灵活的标准要求自己。	仍需继续练习认知重构技术，并在日常生活中应用放松技巧。	1. 每日记录情绪日志 2. 坚持练习腹式呼吸 3. 下周继续面谈跟进 4. 如情况恶化及时联系	2026-03-15 06:14:43.906	目前暂不需要转介。建议继续心理咨询，如症状持续或加重，考虑转介精神科医生。	保持规律作息，适当运动，与家人朋友多沟通交流。学习接受不完美，设定现实可行的目标。	学生家庭背景：父母期望较高。需要关注其自我评价过低的问题。建议下次会谈探讨家庭关系对其影响。	{}	2026-03-08 06:14:43.907	2026-03-08 06:14:43.907
60ff901e-d3e6-4fe7-9f0c-35f4aac48cae	ir-10	低落	5	5	9	学业压力较大，对未来职业发展感到迷茫，与室友关系需要改善。近期睡眠质量下降，注意力难以集中。	中低风险	目前无自伤自杀风险，但需关注学业压力和社交适应问题。建议定期跟进，必要时转介精神科。	本次会话主要围绕学业压力展开。学生表达了对期末考试的担忧和对未来就业的不确定性。通过认知重构技术，帮助学生识别自动化负性思维，并学习用更平衡的视角看待压力情境。	{倾听与共情,开放式提问}	学生参与度较高，能够主动分享内心想法。在练习环节积极配合，对CBT技术表现出兴趣。	1. 识别了完美主义思维模式 2. 学习了呼吸放松技巧 3. 制定了逐步面对焦虑的计划	会话开始时学生情绪较为紧张，随着会谈进行逐渐放松，结束时表示感到有希望和动力。	放松	2	5	6	7	学生首次意识到自己的完美主义倾向，并表示愿意尝试用更灵活的标准要求自己。	仍需继续练习认知重构技术，并在日常生活中应用放松技巧。	1. 每日记录情绪日志 2. 坚持练习腹式呼吸 3. 下周继续面谈跟进 4. 如情况恶化及时联系	2026-03-15 06:14:43.909	目前暂不需要转介。建议继续心理咨询，如症状持续或加重，考虑转介精神科医生。	保持规律作息，适当运动，与家人朋友多沟通交流。学习接受不完美，设定现实可行的目标。	学生家庭背景：父母期望较高。需要关注其自我评价过低的问题。建议下次会谈探讨家庭关系对其影响。	{}	2026-03-08 06:14:43.91	2026-03-08 06:14:43.91
71e9bfc7-dc10-4f32-8df2-81f16cff2993	ir-12	焦虑	5	3	5	学业压力较大，对未来职业发展感到迷茫，与室友关系需要改善。近期睡眠质量下降，注意力难以集中。	低风险	目前无自伤自杀风险，但需关注学业压力和社交适应问题。建议定期跟进，必要时转介精神科。	本次会话主要围绕学业压力展开。学生表达了对期末考试的担忧和对未来就业的不确定性。通过认知重构技术，帮助学生识别自动化负性思维，并学习用更平衡的视角看待压力情境。	{倾听与共情,开放式提问}	学生参与度较高，能够主动分享内心想法。在练习环节积极配合，对CBT技术表现出兴趣。	1. 识别了完美主义思维模式 2. 学习了呼吸放松技巧 3. 制定了逐步面对焦虑的计划	会话开始时学生情绪较为紧张，随着会谈进行逐渐放松，结束时表示感到有希望和动力。	平静	4	3	2	6	学生首次意识到自己的完美主义倾向，并表示愿意尝试用更灵活的标准要求自己。	仍需继续练习认知重构技术，并在日常生活中应用放松技巧。	1. 每日记录情绪日志 2. 坚持练习腹式呼吸 3. 下周继续面谈跟进 4. 如情况恶化及时联系	2026-03-15 06:14:43.912	目前暂不需要转介。建议继续心理咨询，如症状持续或加重，考虑转介精神科医生。	保持规律作息，适当运动，与家人朋友多沟通交流。学习接受不完美，设定现实可行的目标。	学生家庭背景：父母期望较高。需要关注其自我评价过低的问题。建议下次会谈探讨家庭关系对其影响。	{}	2026-03-08 06:14:43.913	2026-03-08 06:14:43.913
558d3e17-9935-4fec-ac0f-4a64b6aa96a1	ir-14	焦虑	5	2	9	学业压力较大，对未来职业发展感到迷茫，与室友关系需要改善。近期睡眠质量下降，注意力难以集中。	低风险	目前无自伤自杀风险，但需关注学业压力和社交适应问题。建议定期跟进，必要时转介精神科。	本次会话主要围绕学业压力展开。学生表达了对期末考试的担忧和对未来就业的不确定性。通过认知重构技术，帮助学生识别自动化负性思维，并学习用更平衡的视角看待压力情境。	{倾听与共情,开放式提问}	学生参与度较高，能够主动分享内心想法。在练习环节积极配合，对CBT技术表现出兴趣。	1. 识别了完美主义思维模式 2. 学习了呼吸放松技巧 3. 制定了逐步面对焦虑的计划	会话开始时学生情绪较为紧张，随着会谈进行逐渐放松，结束时表示感到有希望和动力。	充满希望	3	2	8	6	学生首次意识到自己的完美主义倾向，并表示愿意尝试用更灵活的标准要求自己。	仍需继续练习认知重构技术，并在日常生活中应用放松技巧。	1. 每日记录情绪日志 2. 坚持练习腹式呼吸 3. 下周继续面谈跟进 4. 如情况恶化及时联系	2026-03-15 06:14:43.916	目前暂不需要转介。建议继续心理咨询，如症状持续或加重，考虑转介精神科医生。	保持规律作息，适当运动，与家人朋友多沟通交流。学习接受不完美，设定现实可行的目标。	学生家庭背景：父母期望较高。需要关注其自我评价过低的问题。建议下次会谈探讨家庭关系对其影响。	{}	2026-03-08 06:14:43.916	2026-03-08 06:14:43.916
0459a135-d98f-47de-94fa-db3d613c47d7	ir-17	疲惫	7	2	9	学业压力较大，对未来职业发展感到迷茫，与室友关系需要改善。近期睡眠质量下降，注意力难以集中。	中等风险	目前无自伤自杀风险，但需关注学业压力和社交适应问题。建议定期跟进，必要时转介精神科。	本次会话主要围绕学业压力展开。学生表达了对期末考试的担忧和对未来就业的不确定性。通过认知重构技术，帮助学生识别自动化负性思维，并学习用更平衡的视角看待压力情境。	{倾听与共情,开放式提问}	学生参与度较高，能够主动分享内心想法。在练习环节积极配合，对CBT技术表现出兴趣。	1. 识别了完美主义思维模式 2. 学习了呼吸放松技巧 3. 制定了逐步面对焦虑的计划	会话开始时学生情绪较为紧张，随着会谈进行逐渐放松，结束时表示感到有希望和动力。	积极	4	2	6	7	学生首次意识到自己的完美主义倾向，并表示愿意尝试用更灵活的标准要求自己。	仍需继续练习认知重构技术，并在日常生活中应用放松技巧。	1. 每日记录情绪日志 2. 坚持练习腹式呼吸 3. 下周继续面谈跟进 4. 如情况恶化及时联系	2026-03-15 06:14:43.919	目前暂不需要转介。建议继续心理咨询，如症状持续或加重，考虑转介精神科医生。	保持规律作息，适当运动，与家人朋友多沟通交流。学习接受不完美，设定现实可行的目标。	学生家庭背景：父母期望较高。需要关注其自我评价过低的问题。建议下次会谈探讨家庭关系对其影响。	{}	2026-03-08 06:14:43.92	2026-03-08 06:14:43.92
d79cfbf5-556d-4fb0-8850-dc5f404b2dd1	ir-20	紧张	3	4	4	学业压力较大，对未来职业发展感到迷茫，与室友关系需要改善。近期睡眠质量下降，注意力难以集中。	中低风险	目前无自伤自杀风险，但需关注学业压力和社交适应问题。建议定期跟进，必要时转介精神科。	本次会话主要围绕学业压力展开。学生表达了对期末考试的担忧和对未来就业的不确定性。通过认知重构技术，帮助学生识别自动化负性思维，并学习用更平衡的视角看待压力情境。	{倾听与共情,开放式提问}	学生参与度较高，能够主动分享内心想法。在练习环节积极配合，对CBT技术表现出兴趣。	1. 识别了完美主义思维模式 2. 学习了呼吸放松技巧 3. 制定了逐步面对焦虑的计划	会话开始时学生情绪较为紧张，随着会谈进行逐渐放松，结束时表示感到有希望和动力。	放松	1	4	3	6	学生首次意识到自己的完美主义倾向，并表示愿意尝试用更灵活的标准要求自己。	仍需继续练习认知重构技术，并在日常生活中应用放松技巧。	1. 每日记录情绪日志 2. 坚持练习腹式呼吸 3. 下周继续面谈跟进 4. 如情况恶化及时联系	2026-03-15 06:14:43.922	目前暂不需要转介。建议继续心理咨询，如症状持续或加重，考虑转介精神科医生。	保持规律作息，适当运动，与家人朋友多沟通交流。学习接受不完美，设定现实可行的目标。	学生家庭背景：父母期望较高。需要关注其自我评价过低的问题。建议下次会谈探讨家庭关系对其影响。	{}	2026-03-08 06:14:43.923	2026-03-08 06:14:43.923
32ee7b3f-d96a-4934-a60a-66eb350e5d06	ir-13	疲惫	4	2	9	学业压力较大，对未来职业发展感到迷茫，与室友关系需要改善。近期睡眠质量下降，注意力难以集中。	中等风险	目前无自伤自杀风险，但需关注学业压力和社交适应问题。建议定期跟进，必要时转介精神科。	本次会话主要围绕学业压力展开。学生表达了对期末考试的担忧和对未来就业的不确定性。通过认知重构技术，帮助学生识别自动化负性思维，并学习用更平衡的视角看待压力情境。	{倾听与共情,开放式提问}	学生参与度较高，能够主动分享内心想法。在练习环节积极配合，对CBT技术表现出兴趣。	1. 识别了完美主义思维模式 2. 学习了呼吸放松技巧 3. 制定了逐步面对焦虑的计划	会话开始时学生情绪较为紧张，随着会谈进行逐渐放松，结束时表示感到有希望和动力。	平静	2	2	8	6	学生首次意识到自己的完美主义倾向，并表示愿意尝试用更灵活的标准要求自己。	仍需继续练习认知重构技术，并在日常生活中应用放松技巧。	1. 每日记录情绪日志 2. 坚持练习腹式呼吸 3. 下周继续面谈跟进 4. 如情况恶化及时联系	2026-03-15 06:14:43.925	目前暂不需要转介。建议继续心理咨询，如症状持续或加重，考虑转介精神科医生。	保持规律作息，适当运动，与家人朋友多沟通交流。学习接受不完美，设定现实可行的目标。	学生家庭背景：父母期望较高。需要关注其自我评价过低的问题。建议下次会谈探讨家庭关系对其影响。	{}	2026-03-08 06:14:43.926	2026-03-08 06:14:43.926
8f5efa20-ddd6-4fb2-bdf7-7b44eca2b891	ir-16	紧张	8	2	8	学业压力较大，对未来职业发展感到迷茫，与室友关系需要改善。近期睡眠质量下降，注意力难以集中。	中低风险	目前无自伤自杀风险，但需关注学业压力和社交适应问题。建议定期跟进，必要时转介精神科。	本次会话主要围绕学业压力展开。学生表达了对期末考试的担忧和对未来就业的不确定性。通过认知重构技术，帮助学生识别自动化负性思维，并学习用更平衡的视角看待压力情境。	{倾听与共情,开放式提问}	学生参与度较高，能够主动分享内心想法。在练习环节积极配合，对CBT技术表现出兴趣。	1. 识别了完美主义思维模式 2. 学习了呼吸放松技巧 3. 制定了逐步面对焦虑的计划	会话开始时学生情绪较为紧张，随着会谈进行逐渐放松，结束时表示感到有希望和动力。	放松	5	1	6	7	学生首次意识到自己的完美主义倾向，并表示愿意尝试用更灵活的标准要求自己。	仍需继续练习认知重构技术，并在日常生活中应用放松技巧。	1. 每日记录情绪日志 2. 坚持练习腹式呼吸 3. 下周继续面谈跟进 4. 如情况恶化及时联系	2026-03-15 06:14:43.928	目前暂不需要转介。建议继续心理咨询，如症状持续或加重，考虑转介精神科医生。	保持规律作息，适当运动，与家人朋友多沟通交流。学习接受不完美，设定现实可行的目标。	学生家庭背景：父母期望较高。需要关注其自我评价过低的问题。建议下次会谈探讨家庭关系对其影响。	{}	2026-03-08 06:14:43.929	2026-03-08 06:14:43.929
4b9a936a-a1fb-4bbe-9b83-9830db8bc95d	ir-18	疲惫	5	6	9	学业压力较大，对未来职业发展感到迷茫，与室友关系需要改善。近期睡眠质量下降，注意力难以集中。	低风险	目前无自伤自杀风险，但需关注学业压力和社交适应问题。建议定期跟进，必要时转介精神科。	本次会话主要围绕学业压力展开。学生表达了对期末考试的担忧和对未来就业的不确定性。通过认知重构技术，帮助学生识别自动化负性思维，并学习用更平衡的视角看待压力情境。	{倾听与共情,开放式提问}	学生参与度较高，能够主动分享内心想法。在练习环节积极配合，对CBT技术表现出兴趣。	1. 识别了完美主义思维模式 2. 学习了呼吸放松技巧 3. 制定了逐步面对焦虑的计划	会话开始时学生情绪较为紧张，随着会谈进行逐渐放松，结束时表示感到有希望和动力。	平静	2	5	7	7	学生首次意识到自己的完美主义倾向，并表示愿意尝试用更灵活的标准要求自己。	仍需继续练习认知重构技术，并在日常生活中应用放松技巧。	1. 每日记录情绪日志 2. 坚持练习腹式呼吸 3. 下周继续面谈跟进 4. 如情况恶化及时联系	2026-03-15 06:14:43.932	目前暂不需要转介。建议继续心理咨询，如症状持续或加重，考虑转介精神科医生。	保持规律作息，适当运动，与家人朋友多沟通交流。学习接受不完美，设定现实可行的目标。	学生家庭背景：父母期望较高。需要关注其自我评价过低的问题。建议下次会谈探讨家庭关系对其影响。	{}	2026-03-08 06:14:43.933	2026-03-08 06:14:43.933
2708ac6f-8d16-4656-aede-137990539659	ir-15	紧张	3	3	8	学业压力较大，对未来职业发展感到迷茫，与室友关系需要改善。近期睡眠质量下降，注意力难以集中。	中等风险	目前无自伤自杀风险，但需关注学业压力和社交适应问题。建议定期跟进，必要时转介精神科。	本次会话主要围绕学业压力展开。学生表达了对期末考试的担忧和对未来就业的不确定性。通过认知重构技术，帮助学生识别自动化负性思维，并学习用更平衡的视角看待压力情境。	{倾听与共情,开放式提问}	学生参与度较高，能够主动分享内心想法。在练习环节积极配合，对CBT技术表现出兴趣。	1. 识别了完美主义思维模式 2. 学习了呼吸放松技巧 3. 制定了逐步面对焦虑的计划	会话开始时学生情绪较为紧张，随着会谈进行逐渐放松，结束时表示感到有希望和动力。	平静	1	2	6	6	学生首次意识到自己的完美主义倾向，并表示愿意尝试用更灵活的标准要求自己。	仍需继续练习认知重构技术，并在日常生活中应用放松技巧。	1. 每日记录情绪日志 2. 坚持练习腹式呼吸 3. 下周继续面谈跟进 4. 如情况恶化及时联系	2026-03-15 06:14:43.935	目前暂不需要转介。建议继续心理咨询，如症状持续或加重，考虑转介精神科医生。	保持规律作息，适当运动，与家人朋友多沟通交流。学习接受不完美，设定现实可行的目标。	学生家庭背景：父母期望较高。需要关注其自我评价过低的问题。建议下次会谈探讨家庭关系对其影响。	{}	2026-03-08 06:14:43.936	2026-03-08 06:14:43.936
8bbda5fb-b1c2-4c62-920a-8fa0030ffc2a	ir-19	焦虑	3	4	8	学业压力较大，对未来职业发展感到迷茫，与室友关系需要改善。近期睡眠质量下降，注意力难以集中。	低风险	目前无自伤自杀风险，但需关注学业压力和社交适应问题。建议定期跟进，必要时转介精神科。	本次会话主要围绕学业压力展开。学生表达了对期末考试的担忧和对未来就业的不确定性。通过认知重构技术，帮助学生识别自动化负性思维，并学习用更平衡的视角看待压力情境。	{倾听与共情,开放式提问}	学生参与度较高，能够主动分享内心想法。在练习环节积极配合，对CBT技术表现出兴趣。	1. 识别了完美主义思维模式 2. 学习了呼吸放松技巧 3. 制定了逐步面对焦虑的计划	会话开始时学生情绪较为紧张，随着会谈进行逐渐放松，结束时表示感到有希望和动力。	平静	1	4	5	6	学生首次意识到自己的完美主义倾向，并表示愿意尝试用更灵活的标准要求自己。	仍需继续练习认知重构技术，并在日常生活中应用放松技巧。	1. 每日记录情绪日志 2. 坚持练习腹式呼吸 3. 下周继续面谈跟进 4. 如情况恶化及时联系	2026-03-15 06:14:43.938	目前暂不需要转介。建议继续心理咨询，如症状持续或加重，考虑转介精神科医生。	保持规律作息，适当运动，与家人朋友多沟通交流。学习接受不完美，设定现实可行的目标。	学生家庭背景：父母期望较高。需要关注其自我评价过低的问题。建议下次会谈探讨家庭关系对其影响。	{}	2026-03-08 06:14:43.939	2026-03-08 06:14:43.939
13b250ca-9a28-424a-bfa7-232331d9890d	ir-11	烦躁	5	2	7	学业压力较大，对未来职业发展感到迷茫，与室友关系需要改善。近期睡眠质量下降，注意力难以集中。	中低风险	目前无自伤自杀风险，但需关注学业压力和社交适应问题。建议定期跟进，必要时转介精神科。	本次会话主要围绕学业压力展开。学生表达了对期末考试的担忧和对未来就业的不确定性。通过认知重构技术，帮助学生识别自动化负性思维，并学习用更平衡的视角看待压力情境。	{倾听与共情,开放式提问}	学生参与度较高，能够主动分享内心想法。在练习环节积极配合，对CBT技术表现出兴趣。	1. 识别了完美主义思维模式 2. 学习了呼吸放松技巧 3. 制定了逐步面对焦虑的计划	会话开始时学生情绪较为紧张，随着会谈进行逐渐放松，结束时表示感到有希望和动力。	充满希望	2	1	5	7	学生首次意识到自己的完美主义倾向，并表示愿意尝试用更灵活的标准要求自己。	仍需继续练习认知重构技术，并在日常生活中应用放松技巧。	1. 每日记录情绪日志 2. 坚持练习腹式呼吸 3. 下周继续面谈跟进 4. 如情况恶化及时联系	2026-03-15 06:14:43.942	目前暂不需要转介。建议继续心理咨询，如症状持续或加重，考虑转介精神科医生。	保持规律作息，适当运动，与家人朋友多沟通交流。学习接受不完美，设定现实可行的目标。	学生家庭背景：父母期望较高。需要关注其自我评价过低的问题。建议下次会谈探讨家庭关系对其影响。	{}	2026-03-08 06:14:43.942	2026-03-08 06:14:43.942
\.


--
-- Data for Name: intervention_records; Type: TABLE DATA; Schema: public; Owner: psytwin
--

COPY public.intervention_records (id, student_id, date, type, counselor, duration, result, status, created_at, updated_at) FROM stdin;
ir-01	stu-zhangyu	2026-02-15 00:00:00	REGULAR_INTERVIEW	刘芳	50分钟	状态良好	completed	2026-03-06 14:38:40.724	2026-03-07 15:35:05.83
ir-02	stu-zhangmingyuan	2026-01-20 00:00:00	CBT_THERAPY	张伟	60分钟	认知重构进展顺利	completed	2026-03-06 14:38:40.726	2026-03-07 15:35:05.833
ir-03	stu-liusiyuan	2025-12-28 00:00:00	GROUP_COUNSELING	王丽	90分钟	社交互动改善	completed	2026-03-06 14:38:40.728	2026-03-07 15:35:05.834
ir-04	stu-zhaotianyu	2025-12-15 00:00:00	CRISIS_INTERVENTION	刘芳	45分钟	情绪稳定	completed	2026-03-06 14:38:40.73	2026-03-07 15:35:05.836
ir-05	stu-chenyuqing	2025-11-22 00:00:00	INITIAL_ASSESSMENT	刘芳	60分钟	建立干预方案	completed	2026-03-06 14:38:40.732	2026-03-07 15:35:05.837
ir-06	stu-wuzhiyuan	2026-01-10 00:00:00	CBT_THERAPY	张伟	55分钟	社交焦虑减轻	completed	2026-03-07 14:07:44.092	2026-03-07 15:35:05.839
ir-07	stu-zhouhangyu	2025-11-05 00:00:00	REGULAR_INTERVIEW	王丽	45分钟	心理状态良好	completed	2026-03-07 14:07:44.094	2026-03-07 15:35:05.84
ir-08	stu-huangsimeng	2026-01-15 00:00:00	REGULAR_INTERVIEW	刘芳	50分钟	压力缓解	completed	2026-03-07 14:07:44.096	2026-03-07 15:35:05.842
ir-09	stu-linzhihao	2025-12-01 00:00:00	GROUP_COUNSELING	张伟	85分钟	团队协作能力提升	completed	2026-03-07 14:07:44.097	2026-03-07 15:35:05.843
ir-10	stu-wangyuyan	2025-11-20 00:00:00	CBT_THERAPY	王丽	60分钟	自信心增强	completed	2026-03-07 14:07:44.099	2026-03-07 15:35:05.845
ir-12	stu-sunxiaoxiao	2026-03-08 00:00:00	INITIAL_ASSESSMENT	张伟	65分钟	初步评估进行中	in_progress	2026-03-07 14:07:44.102	2026-03-08 04:44:00.442
ir-14	stu-wuting	2026-03-06 00:00:00	GROUP_COUNSELING	刘芳	90分钟	团体辅导持续进行中	in_progress	2026-03-07 14:07:44.104	2026-03-08 04:44:00.448
ir-17	stu-fengtao	2026-03-07 00:00:00	REGULAR_INTERVIEW	刘芳	45分钟	团队协作能力提升中	in_progress	2026-03-07 14:07:44.109	2026-03-08 04:44:00.457
ir-20	stu-xiaoli	2026-03-06 00:00:00	REGULAR_INTERVIEW	刘芳	50分钟	心理韧性培养进行中	in_progress	2026-03-07 14:07:44.119	2026-03-08 04:44:00.466
ir-13	stu-zhoujian	2026-03-01 00:00:00	REGULAR_INTERVIEW	王丽	45分钟	认知行为治疗进行中	completed	2026-03-07 14:07:44.103	2026-03-08 05:45:31.232
ir-16	stu-wangfang	2026-03-02 00:00:00	REGULAR_INTERVIEW	王丽	50分钟	情绪管理训练中	completed	2026-03-07 14:07:44.108	2026-03-08 05:45:36.44
ir-18	stu-chenjing	2026-03-03 00:00:00	INITIAL_ASSESSMENT	张伟	70分钟	睡眠问题评估中	completed	2026-03-07 14:07:44.111	2026-03-08 05:45:37.701
ir-15	stu-zhengkai	2026-03-04 00:00:00	CBT_THERAPY	张伟	60分钟	思维模式调整中	completed	2026-03-07 14:07:44.106	2026-03-08 05:45:38.135
ir-19	stu-yangbo	2026-03-05 00:00:00	GROUP_COUNSELING	王丽	85分钟	适应性辅导持续中	completed	2026-03-07 14:07:44.112	2026-03-08 05:45:38.56
ir-11	stu-liweimin	2026-03-05 00:00:00	REGULAR_INTERVIEW	刘芳	50分钟	学业规划持续跟进中	completed	2026-03-07 14:07:44.1	2026-03-08 05:45:39.601
\.


--
-- Data for Name: ip_whitelist; Type: TABLE DATA; Schema: public; Owner: psytwin
--

COPY public.ip_whitelist (id, ip_address, description, enabled, created_at, created_by) FROM stdin;
\.


--
-- Data for Name: notification_channels; Type: TABLE DATA; Schema: public; Owner: psytwin
--

COPY public.notification_channels (id, name, type, enabled, config, last_tested_at, "testStatus", created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: notification_histories; Type: TABLE DATA; Schema: public; Owner: psytwin
--

COPY public.notification_histories (id, rule_id, channel_type, recipient, title, content, status, error_msg, sent_at, delivered_at, read_at) FROM stdin;
\.


--
-- Data for Name: notification_rules; Type: TABLE DATA; Schema: public; Owner: psytwin
--

COPY public.notification_rules (id, name, enabled, trigger_type, trigger_config, channels, recipients, template_id, silent_override, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: notification_templates; Type: TABLE DATA; Schema: public; Owner: psytwin
--

COPY public.notification_templates (id, name, type, subject, content, variables, updated_at, updated_by) FROM stdin;
\.


--
-- Data for Name: post_collections; Type: TABLE DATA; Schema: public; Owner: psytwin
--

COPY public.post_collections (id, post_id, student_id, collected_at) FROM stdin;
3bc447e0-80ac-4582-92a5-4691812686b2	post_002	stu-xiaoming	2026-03-08 15:10:54.278
b60d476c-7915-4eb1-8a98-e50c78f46389	post_005	stu-xiaoming	2026-03-08 15:10:54.278
184d9f04-064b-4354-81c3-165c82823195	post_002	stu-xiaojing	2026-03-08 15:10:54.278
00ccb88e-1efd-4a08-a2d4-a0eb76f670e3	post_006	stu-wangmang	2026-03-08 15:10:54.278
6ea7acf7-9ea6-4bdb-907c-3b924a2dbbde	post_007	stu-liulian	2026-03-08 15:10:54.278
\.


--
-- Data for Name: post_likes; Type: TABLE DATA; Schema: public; Owner: psytwin
--

COPY public.post_likes (id, post_id, student_id, created_at) FROM stdin;
c3676d86-02d5-45e5-b29d-b4c311f9fdcd	post_002	stu-xiaoming	2026-03-08 15:10:54.278
8fbb9cd5-7250-43b4-a667-4294f2d5391a	post_001	stu-xiaoming	2026-03-08 17:35:41.066
981ea931-eed6-441c-b2fa-1f0d167b8934	post_002	stu-xiaojing	2026-03-08 15:10:54.278
050a9ddc-2980-4bbc-9db4-1a516bc1ce45	post_003	stu-xiaojing	2026-03-08 15:10:54.278
c9627808-5981-4f90-a16e-eb268185f32c	post_002	stu-zhengjiawen	2026-03-08 15:10:54.278
f34fc0b4-6b35-4ca4-bcf2-b64282218e4d	post_001	stu-wangmang	2026-03-08 15:10:54.278
1a072a15-1cfb-4899-b5bf-020f93e420f6	post_002	stu-wangmang	2026-03-08 15:10:54.278
94d6c211-8de4-46a1-bb7b-1f1e6fd7e3a2	post_003	stu-wangmang	2026-03-08 15:10:54.278
688d35a3-85ea-4f9a-9194-26b527cf304b	post_001	stu-liulian	2026-03-08 15:10:54.278
1b1c6d55-4d35-454a-bf27-f5c8b223d6f2	post_003	stu-liulian	2026-03-08 15:10:54.278
8ba60a48-676c-490e-bf6d-5d72794e58ee	post_003	stu-mengfei	2026-03-08 15:10:54.278
\.


--
-- Data for Name: posts; Type: TABLE DATA; Schema: public; Owner: psytwin
--

COPY public.posts (id, author_id, content, images, location, is_anonymous, tags, like_count, comment_count, risk_score, view_count, status, created_at, updated_at) FROM stdin;
post_003	stu-zhengjiawen	不知道为什么就是心里沉甸甸的，什么都不想做，但又不知道能跟谁说。发出来只是想让自己轻松一点。	{}		t	{情绪,树洞}	89	31	0.55	234	ACTIVE	2026-03-08 15:10:54.397	2026-03-08 15:10:54.397
post_004	stu-wangmang	兄弟们刚打完一场球！汗流浃背但超开心，还是运动能让人忘却烦恼。建议压力大的同学都去打球，真的很解压！	{https://picsum.photos/400/500?random=44}	体育馆	f	{运动,解压,正能量}	52	9	0.1	178	ACTIVE	2026-03-08 15:10:54.4	2026-03-08 15:10:54.4
post_005	stu-liulian	读了一本关于放下的书，主人公说"我不需要别人的认可，只需要我自己的认可"。这句话不知道为什么看得我非常感动。	{https://picsum.photos/400/280?random=55}	图书馆	f	{阅读,感悟,成长}	67	14	0.2	245	ACTIVE	2026-03-08 15:10:54.404	2026-03-08 15:10:54.404
post_007	stu-mengfei	今天展出了自己画了半年的作品，老师说暴露自己是一种勇气。我想是的。创作一直是我排解不安的方式。	{https://picsum.photos/400/460?random=77}	艺术展览馆	f	{艺术,创作,成长}	44	6	0.18	132	ACTIVE	2026-03-08 15:10:54.414	2026-03-08 15:10:54.414
post_008	stu-wangli	考前第一次失眠，脑子躺在床上数羊数到一千万都还没睡着。甚至开始分析出考试是设计来考验人的心理承受能力的结论。你们这次期末有没有这样的时刻？	{}		t	{考前焦虑,失眠,求助}	156	58	0.45	567	ACTIVE	2026-03-08 15:10:54.418	2026-03-08 15:10:54.418
post_001	stu-xiaojing	期末复习第三天，看书看得眼睛都花了。出来操场转了一圈，改变环境后发现脑子好像清醒了一些！小友伴们期末努力！	{https://picsum.photos/400/300?random=11}	校园操场	f	{期末,学习,正能量}	38	8	0.15	156	ACTIVE	2026-03-08 15:10:02.073	2026-03-08 17:35:42.911
post_002	stu-xiaojing	【小贴士】当你感到压力山大的时候，试试 4-7-8 呼吸法：吸气 4 秒 → 屏气 7 秒 → 呼气 8 秒。反复 4 次，就能快速缓解焦虑。希望这个小方法能帮到大家✨	{}		f	{心理健康,减压,小贴士}	126	23	0.05	892	ACTIVE	2026-03-08 15:10:54.39	2026-03-08 15:10:54.39
post_006	stu-xiaojing	【这周公开课】"与情绪和谐相处" 将于本周四下午 3 点在学活中心 101 开课，免费开放。我们一起探讨如何识别负面情绪并与之共处，而不是进行压抑。欢迎预约✨	{}	学活中心 101	f	{公开课,情绪管理,活动}	203	41	0.05	1024	ACTIVE	2026-03-08 15:10:54.409	2026-03-08 15:10:54.409
\.


--
-- Data for Name: psych_profiles; Type: TABLE DATA; Schema: public; Owner: psytwin
--

COPY public.psych_profiles (id, student_id, adversity_quotient, emotional_stability, social_tendency, stress_resistance, self_awareness, empathy, willpower, adaptability, overall_score, created_at, updated_at) FROM stdin;
pp-stu-linzhihao	stu-linzhihao	85	82	78	88	85	75	86	84	83	2026-03-06 14:38:40.653	2026-03-07 15:35:05.875
pp-stu-wangyuyan	stu-wangyuyan	65	68	62	70	72	78	66	70	69	2026-03-06 14:38:40.654	2026-03-07 15:35:05.876
pp-stu-liweimin	stu-liweimin	70	65	68	72	70	68	72	70	70	2026-03-07 14:48:47.127	2026-03-07 15:35:05.878
pp-stu-sunxiaoxiao	stu-sunxiaoxiao	50	45	55	48	52	60	48	52	51	2026-03-07 14:48:47.129	2026-03-07 15:35:05.879
pp-stu-zhoujian	stu-zhoujian	80	78	75	82	80	72	82	80	79	2026-03-07 14:48:47.13	2026-03-07 15:35:05.881
pp-stu-wuting	stu-wuting	72	70	78	75	74	76	72	76	74	2026-03-07 14:48:47.132	2026-03-07 15:35:05.882
pp-stu-zhengkai	stu-zhengkai	58	52	62	55	60	62	55	58	58	2026-03-07 14:48:47.133	2026-03-07 15:35:05.884
pp-stu-wangfang	stu-wangfang	68	70	65	68	70	74	68	70	69	2026-03-07 14:48:47.135	2026-03-07 15:35:05.885
pp-stu-fengtao	stu-fengtao	82	78	85	80	78	76	80	82	80	2026-03-07 14:48:47.136	2026-03-07 15:35:05.887
pp-stu-chenjing	stu-chenjing	52	48	58	50	55	62	52	54	54	2026-03-07 14:48:47.138	2026-03-07 15:35:05.888
pp-stu-yangbo	stu-yangbo	75	72	80	78	76	70	76	78	76	2026-03-07 14:48:47.139	2026-03-07 15:35:05.89
pp-stu-xiaoli	stu-xiaoli	78	80	82	80	82	85	80	82	81	2026-03-07 14:48:47.142	2026-03-07 15:35:05.891
a25c7459-659e-4275-a45d-a90cc76f8fa4	stu-liulian	84	79	83	84	79	84	78	86	82	2026-03-10 15:36:31.691	2026-03-10 15:36:31.691
de428de6-a06c-495a-ba83-30270b146ea7	stu-mengfei	86	82	85	81	87	84	82	86	84	2026-03-10 15:36:31.695	2026-03-10 15:36:31.695
6309987c-e519-493a-b9e9-75fd49178658	stu-wangli	68	68	67	69	66	66	66	72	68	2026-03-10 15:36:31.696	2026-03-10 15:36:31.696
23ec30aa-bb13-4e36-972f-c7f84f0277a0	stu-wangmang	80	81	74	74	79	76	73	81	77	2026-03-10 15:36:31.698	2026-03-10 15:36:31.698
33b0b276-8c25-43e9-b4b0-8e40b5adb4c5	stu-xiaojing	81	83	88	79	81	82	79	84	82	2026-03-10 15:36:31.7	2026-03-10 15:36:31.7
e1aaab87-c37f-4b88-9755-777b2f902c1c	stu-xiaoming	82	85	87	81	89	86	87	83	85	2026-03-10 15:36:31.702	2026-03-10 15:36:31.702
c8bdd820-6b85-4407-a46d-0a7c14b2e7b3	stu-zhengjiawen	61	59	62	59	61	63	67	64	62	2026-03-10 15:36:31.703	2026-03-10 15:36:31.703
pp-stu-zhangyu	stu-zhangyu	82	75	68	85	78	72	80	76	77	2026-03-06 14:38:40.638	2026-03-07 15:35:05.861
pp-stu-liusiyuan	stu-liusiyuan	68	62	75	70	72	85	65	78	72	2026-03-06 14:38:40.641	2026-03-07 15:35:05.864
pp-stu-chenyuqing	stu-chenyuqing	55	48	58	52	60	65	50	55	55	2026-03-06 14:38:40.643	2026-03-07 15:35:05.865
pp-stu-zhangmingyuan	stu-zhangmingyuan	72	68	82	75	70	78	73	80	75	2026-03-06 14:38:40.644	2026-03-07 15:35:05.867
pp-stu-wuzhiyuan	stu-wuzhiyuan	48	45	52	50	55	58	48	52	51	2026-03-06 14:38:40.646	2026-03-07 15:35:05.868
pp-stu-zhouhangyu	stu-zhouhangyu	78	72	85	80	75	80	78	82	79	2026-03-06 14:38:40.648	2026-03-07 15:35:05.87
pp-stu-zhaotianyu	stu-zhaotianyu	52	50	55	48	58	62	50	54	54	2026-03-06 14:38:40.649	2026-03-07 15:35:05.872
pp-stu-huangsimeng	stu-huangsimeng	70	75	72	68	74	80	72	76	73	2026-03-06 14:38:40.651	2026-03-07 15:35:05.873
\.


--
-- Data for Name: room_devices; Type: TABLE DATA; Schema: public; Owner: psytwin
--

COPY public.room_devices (id, room_id, device_id, created_at, updated_at) FROM stdin;
rd-1	room-001	dev-vr-1	2026-03-07 15:35:06.148	2026-03-07 15:35:06.148
rd-2	room-001	dev-br-1	2026-03-07 15:35:06.153	2026-03-07 15:35:06.153
rd-3	room-001	dev-eeg-1	2026-03-07 15:35:06.157	2026-03-07 15:35:06.157
rd-4	room-001	dev-eeg-2	2026-03-07 15:35:06.16	2026-03-07 15:35:06.16
rd-5	room-002	dev-vr-2	2026-03-07 15:35:06.164	2026-03-07 15:35:06.164
rd-6	room-002	dev-br-2	2026-03-07 15:35:06.166	2026-03-07 15:35:06.166
rd-7	room-002	dev-eeg-3	2026-03-07 15:35:06.169	2026-03-07 15:35:06.169
rd-8	room-003	dev-vr-3	2026-03-07 15:35:06.173	2026-03-07 15:35:06.173
rd-9	room-003	dev-br-3	2026-03-07 15:35:06.176	2026-03-07 15:35:06.176
rd-10	room-003	dev-eeg-4	2026-03-07 15:35:06.18	2026-03-07 15:35:06.18
rd-11	room-004	dev-vr-4	2026-03-07 15:35:06.184	2026-03-07 15:35:06.184
rd-12	room-004	dev-br-4	2026-03-07 15:35:06.187	2026-03-07 15:35:06.187
rd-13	room-004	dev-eeg-5	2026-03-07 15:35:06.19	2026-03-07 15:35:06.19
rd-14	room-005	dev-vr-5	2026-03-07 15:35:06.193	2026-03-07 15:35:06.193
rd-15	room-005	dev-br-5	2026-03-07 15:35:06.196	2026-03-07 15:35:06.196
rd-16	room-005	dev-eeg-6	2026-03-07 15:35:06.2	2026-03-07 15:35:06.2
rd-17	room-006	dev-vr-6	2026-03-07 15:35:06.204	2026-03-07 15:35:06.204
rd-18	room-006	dev-vr-7	2026-03-07 15:35:06.207	2026-03-07 15:35:06.207
rd-19	room-006	dev-br-6	2026-03-07 15:35:06.21	2026-03-07 15:35:06.21
rd-20	room-007	dev-vr-8	2026-03-07 15:35:06.213	2026-03-07 15:35:06.213
rd-21	room-007	dev-vr-9	2026-03-07 15:35:06.216	2026-03-07 15:35:06.216
rd-22	room-007	dev-br-7	2026-03-07 15:35:06.219	2026-03-07 15:35:06.219
rd-23	room-008	dev-vr-10	2026-03-07 15:35:06.223	2026-03-07 15:35:06.223
rd-24	room-008	dev-br-8	2026-03-07 15:35:06.226	2026-03-07 15:35:06.226
rd-25	room-009	dev-br-9	2026-03-07 15:35:06.229	2026-03-07 15:35:06.229
rd-26	room-010	dev-br-10	2026-03-07 15:35:06.233	2026-03-07 15:35:06.233
\.


--
-- Data for Name: schedules; Type: TABLE DATA; Schema: public; Owner: psytwin
--

COPY public.schedules (id, teacher_id, day_of_week, start_time, end_time, is_available, max_appointments, created_at, updated_at) FROM stdin;
094b7056-2248-45e7-8762-93cf1af068e9	0fa779d7-9402-46cf-8c32-a4e6cb8806b0	1	09:00	12:00	t	4	2026-03-07 08:49:00.924	2026-03-07 08:49:00.924
752373ef-5bd4-4be4-8bca-cdc4639d80cd	0fa779d7-9402-46cf-8c32-a4e6cb8806b0	1	14:00	17:00	t	4	2026-03-07 08:49:00.924	2026-03-07 08:49:00.924
85a6f4e2-f598-401c-b34a-eb4045bef8b1	0fa779d7-9402-46cf-8c32-a4e6cb8806b0	2	09:00	12:00	t	4	2026-03-07 08:49:00.924	2026-03-07 08:49:00.924
033ec294-708b-448a-bad3-63e2401c732d	0fa779d7-9402-46cf-8c32-a4e6cb8806b0	3	14:00	17:00	t	4	2026-03-07 08:49:00.924	2026-03-07 08:49:00.924
0243c261-572f-4609-b950-7f69ff7d12fb	0fa779d7-9402-46cf-8c32-a4e6cb8806b0	4	09:00	12:00	t	4	2026-03-07 08:49:00.924	2026-03-07 08:49:00.924
4ba451e2-9c93-4779-8f4f-5e8bdc30bd75	0fa779d7-9402-46cf-8c32-a4e6cb8806b0	5	14:00	17:00	t	4	2026-03-07 08:49:00.924	2026-03-07 08:49:00.924
94985063-1c64-4fb5-878f-c544b5386105	c2111ec6-0af8-43cc-a731-5548eed510c3	1	14:00	17:00	t	4	2026-03-07 08:49:00.927	2026-03-07 08:49:00.927
f451ea7d-d1f7-47f2-bf1a-f52d44bf431c	c2111ec6-0af8-43cc-a731-5548eed510c3	2	09:00	12:00	t	4	2026-03-07 08:49:00.927	2026-03-07 08:49:00.927
0a4fade3-bedd-4a8d-8b42-e27934587c34	c2111ec6-0af8-43cc-a731-5548eed510c3	3	14:00	17:00	t	4	2026-03-07 08:49:00.927	2026-03-07 08:49:00.927
d091ae12-0f9c-4fea-a351-69483d16026c	c2111ec6-0af8-43cc-a731-5548eed510c3	4	09:00	12:00	t	4	2026-03-07 08:49:00.927	2026-03-07 08:49:00.927
81e4df38-4b2e-4be0-9f4a-ff6ce30685c6	c2111ec6-0af8-43cc-a731-5548eed510c3	5	14:00	17:00	t	4	2026-03-07 08:49:00.927	2026-03-07 08:49:00.927
85a22f9d-98eb-47ed-8b0c-0c9d477800fc	0fa779d7-9402-46cf-8c32-a4e6cb8806b0	1	09:00	12:00	t	4	2026-03-07 08:53:59.933	2026-03-07 08:53:59.933
433e8777-a1f5-4050-8103-a0ce8ed9873c	0fa779d7-9402-46cf-8c32-a4e6cb8806b0	1	14:00	17:00	t	4	2026-03-07 08:53:59.933	2026-03-07 08:53:59.933
3304d084-1c8a-45a3-9f89-958fe90ecd02	0fa779d7-9402-46cf-8c32-a4e6cb8806b0	2	09:00	12:00	t	4	2026-03-07 08:53:59.933	2026-03-07 08:53:59.933
5b76c367-9a7e-4305-87c1-a7fbd51aa588	0fa779d7-9402-46cf-8c32-a4e6cb8806b0	3	14:00	17:00	t	4	2026-03-07 08:53:59.933	2026-03-07 08:53:59.933
5f98d949-1e57-4923-aa25-5cbdb7fc6da2	0fa779d7-9402-46cf-8c32-a4e6cb8806b0	4	09:00	12:00	t	4	2026-03-07 08:53:59.933	2026-03-07 08:53:59.933
f0232c48-5e10-45c4-85e2-e55f99d3acb1	0fa779d7-9402-46cf-8c32-a4e6cb8806b0	5	14:00	17:00	t	4	2026-03-07 08:53:59.933	2026-03-07 08:53:59.933
1e3d1c6a-2d38-408a-867a-ba2ddb6ed06b	c2111ec6-0af8-43cc-a731-5548eed510c3	1	14:00	17:00	t	4	2026-03-07 08:53:59.938	2026-03-07 08:53:59.938
b6731a05-8a79-44ea-adf3-6420cb06527a	c2111ec6-0af8-43cc-a731-5548eed510c3	2	09:00	12:00	t	4	2026-03-07 08:53:59.938	2026-03-07 08:53:59.938
df5b5559-b266-43a4-9abc-21c95bbcca8e	c2111ec6-0af8-43cc-a731-5548eed510c3	3	14:00	17:00	t	4	2026-03-07 08:53:59.938	2026-03-07 08:53:59.938
490081af-0276-4749-a2fd-3cf79ba89097	c2111ec6-0af8-43cc-a731-5548eed510c3	4	09:00	12:00	t	4	2026-03-07 08:53:59.938	2026-03-07 08:53:59.938
c798f7ec-7efe-4dab-bc3f-b84b1bf2df0e	c2111ec6-0af8-43cc-a731-5548eed510c3	5	14:00	17:00	t	4	2026-03-07 08:53:59.938	2026-03-07 08:53:59.938
02229874-82c5-4072-9991-bd7a67cd1db3	0fa779d7-9402-46cf-8c32-a4e6cb8806b0	1	09:00	12:00	t	4	2026-03-07 09:23:48.098	2026-03-07 09:23:48.098
d38113dc-7c71-425d-9c36-af1711ebce7d	0fa779d7-9402-46cf-8c32-a4e6cb8806b0	1	14:00	17:00	t	4	2026-03-07 09:23:48.098	2026-03-07 09:23:48.098
18640b9e-dfa2-4e04-9cdb-15f80ccc2a35	0fa779d7-9402-46cf-8c32-a4e6cb8806b0	2	09:00	12:00	t	4	2026-03-07 09:23:48.098	2026-03-07 09:23:48.098
abcd52c8-0202-4c0b-b019-52020658b225	0fa779d7-9402-46cf-8c32-a4e6cb8806b0	3	14:00	17:00	t	4	2026-03-07 09:23:48.098	2026-03-07 09:23:48.098
36703b37-786f-47a1-bcc1-b83f6be7b63d	0fa779d7-9402-46cf-8c32-a4e6cb8806b0	4	09:00	12:00	t	4	2026-03-07 09:23:48.098	2026-03-07 09:23:48.098
7559616f-ddee-4876-ba6f-dc186f95e557	0fa779d7-9402-46cf-8c32-a4e6cb8806b0	5	14:00	17:00	t	4	2026-03-07 09:23:48.098	2026-03-07 09:23:48.098
ea74aacd-ee94-4bb1-8e75-083bd25f48e8	c2111ec6-0af8-43cc-a731-5548eed510c3	1	14:00	17:00	t	4	2026-03-07 09:23:48.102	2026-03-07 09:23:48.102
659d346b-5331-4912-8644-a3b1ae4f3b9b	c2111ec6-0af8-43cc-a731-5548eed510c3	2	09:00	12:00	t	4	2026-03-07 09:23:48.102	2026-03-07 09:23:48.102
e9d7d0ce-c7fb-4c8f-9440-456438f53732	c2111ec6-0af8-43cc-a731-5548eed510c3	3	14:00	17:00	t	4	2026-03-07 09:23:48.102	2026-03-07 09:23:48.102
b6764f30-9566-4fd9-9e2e-9df26643526a	c2111ec6-0af8-43cc-a731-5548eed510c3	4	09:00	12:00	t	4	2026-03-07 09:23:48.102	2026-03-07 09:23:48.102
d1ca2ce0-973a-424b-b426-7d9b97999eca	c2111ec6-0af8-43cc-a731-5548eed510c3	5	14:00	17:00	t	4	2026-03-07 09:23:48.102	2026-03-07 09:23:48.102
\.


--
-- Data for Name: silent_hours; Type: TABLE DATA; Schema: public; Owner: psytwin
--

COPY public.silent_hours (id, enabled, start_time, end_time, except_level) FROM stdin;
\.


--
-- Data for Name: student_notifications; Type: TABLE DATA; Schema: public; Owner: psytwin
--

COPY public.student_notifications (id, student_id, type, title, content, action_url, is_read, read_at, created_at) FROM stdin;
0172caac-860c-4cbd-ae05-02a72a35b64f	stu-chenyuqing	CHAT	CHAT Notification	This is a test notification for CHAT	\N	t	2026-03-07 11:12:48.456	2026-03-07 12:31:54.02
7c9cf2aa-3bf0-408a-80ce-c47c1deeec08	stu-chenyuqing	APPOINTMENT	APPOINTMENT Notification	This is a test notification for APPOINTMENT	\N	t	2026-03-07 22:59:25.618	2026-03-05 10:14:22.732
2d2281e7-931f-4f4a-8a6f-ed247cf75139	stu-chenyuqing	CHAT	CHAT Notification	This is a test notification for CHAT	\N	t	2026-03-06 20:24:39.85	2026-03-07 09:37:34.766
8745f623-0ffa-4d1f-adf4-db449e592a7b	stu-chenyuqing	COMMENT	COMMENT Notification	This is a test notification for COMMENT	\N	t	2026-03-07 17:47:16.249	2026-03-05 21:12:44.977
4ce83d0f-6caf-41ce-a5cc-84a5b78aa8ed	stu-chenyuqing	COMMENT	COMMENT Notification	This is a test notification for COMMENT	\N	t	2026-03-08 09:17:21.998	2026-03-02 02:27:35.091
5d38ef19-2412-4b13-bf2a-aa473dfdd585	stu-chenyuqing	SYSTEM	SYSTEM Notification	This is a test notification for SYSTEM	\N	f	\N	2026-03-02 11:13:23.862
5d3985a0-5f24-4535-a839-71d3a1bbe321	stu-chenyuqing	APPOINTMENT	APPOINTMENT Notification	This is a test notification for APPOINTMENT	\N	f	\N	2026-03-07 02:50:14.492
879ee2c6-655a-43f2-8880-2df70dc94f00	stu-zhangmingyuan	WARNING	WARNING Notification	This is a test notification for WARNING	\N	f	\N	2026-03-04 01:20:46.489
818017e3-cf53-44b1-b151-962c620f364b	stu-zhangmingyuan	CHAT	CHAT Notification	This is a test notification for CHAT	\N	t	2026-03-07 03:20:29.815	2026-03-07 02:05:46.919
10d5de01-f430-4122-a2cf-2dca9227ea66	stu-zhangmingyuan	COMMENT	COMMENT Notification	This is a test notification for COMMENT	\N	t	2026-03-08 08:19:34.999	2026-03-08 12:50:29.771
349b4528-7bf7-402d-bc12-5245c36c9d56	stu-zhangmingyuan	POST	POST Notification	This is a test notification for POST	\N	f	\N	2026-03-01 18:16:39.377
90d68300-d2a8-4402-869a-53da95f603c2	stu-zhangmingyuan	APPOINTMENT	APPOINTMENT Notification	This is a test notification for APPOINTMENT	\N	f	\N	2026-03-02 09:15:15.877
64593153-b1e3-4fa6-9aa8-70bbab501d5b	stu-zhangmingyuan	POST	POST Notification	This is a test notification for POST	\N	t	2026-03-06 22:52:36.411	2026-03-04 10:48:57.246
36b8ab66-4cc6-4386-9b52-84ef2f80ffd8	stu-zhangmingyuan	COMMENT	COMMENT Notification	This is a test notification for COMMENT	\N	f	\N	2026-03-06 10:57:10.535
8b865558-71af-4a96-b080-2d8fbd176900	stu-wuzhiyuan	POST	POST Notification	This is a test notification for POST	\N	f	\N	2026-03-07 11:56:02.847
9710fcc9-87e3-447b-a492-c782a7bc54e4	stu-wuzhiyuan	POST	POST Notification	This is a test notification for POST	\N	f	\N	2026-03-05 09:51:33.597
0ef1a137-44ca-4f66-8ab3-98adf60891b8	stu-wuzhiyuan	CHAT	CHAT Notification	This is a test notification for CHAT	\N	t	2026-03-07 14:09:27.877	2026-03-05 04:07:42.035
aadc8a51-e99f-4562-ade2-0b7bf3ff9638	stu-zhouhangyu	SYSTEM	SYSTEM Notification	This is a test notification for SYSTEM	\N	t	2026-03-08 08:29:27.597	2026-03-06 00:32:41.523
c7ece3fe-8956-4b21-b9fd-cf2062bbf1f4	stu-zhouhangyu	COMMENT	COMMENT Notification	This is a test notification for COMMENT	\N	f	\N	2026-03-05 14:53:09.481
4c2fec55-08ef-4bb9-b776-603205369752	stu-zhouhangyu	CHAT	CHAT Notification	This is a test notification for CHAT	\N	f	\N	2026-03-02 20:51:09.91
34015706-5cb8-4f96-88a1-69fad9150579	stu-zhouhangyu	POST	POST Notification	This is a test notification for POST	\N	t	2026-03-07 08:35:49.485	2026-03-05 06:30:16.57
c64f3436-c5dd-4ed0-bdcd-11ede4287828	stu-zhouhangyu	WARNING	WARNING Notification	This is a test notification for WARNING	\N	f	\N	2026-03-06 23:13:28.157
b5970c08-cd4c-4d1c-ba96-c418d1fcc4cc	stu-zhouhangyu	SYSTEM	SYSTEM Notification	This is a test notification for SYSTEM	\N	f	\N	2026-03-07 13:11:57.948
df74a2cb-3a64-4dd2-b644-1edf2158edcb	stu-zhaotianyu	CHAT	CHAT Notification	This is a test notification for CHAT	\N	f	\N	2026-03-03 06:53:42.94
5eac6b8f-cdb9-4244-82cc-f8bf446d0ff5	stu-zhaotianyu	APPOINTMENT	APPOINTMENT Notification	This is a test notification for APPOINTMENT	\N	f	\N	2026-03-08 05:01:03.017
28cdf5ed-752a-48aa-81f1-dcfb3fb94e6f	stu-zhaotianyu	SYSTEM	SYSTEM Notification	This is a test notification for SYSTEM	\N	f	\N	2026-03-05 20:08:27.213
7ea3e76e-9f19-42ae-8498-3dd26fe7f7ab	stu-zhaotianyu	POST	POST Notification	This is a test notification for POST	\N	t	2026-03-06 22:01:13.776	2026-03-05 10:04:24.736
86a33373-b162-4e13-a200-42bd1a61f7e4	stu-zhaotianyu	APPOINTMENT	APPOINTMENT Notification	This is a test notification for APPOINTMENT	\N	f	\N	2026-03-05 23:17:19.017
36455d91-a60d-432d-a3c7-434f31d52e80	stu-zhaotianyu	WARNING	WARNING Notification	This is a test notification for WARNING	\N	t	2026-03-06 03:13:22.625	2026-03-01 13:56:10.512
notif_001	stu-xiaoming	APPOINTMENT	预约成功	您预约的 3月8日 心理咨询室 A01 已确认	/pages/appointment/index	f	\N	2026-03-08 15:10:54.278
notif_002	stu-xiaoming	SYSTEM	欢迎使用 PsyTwin	感谢注册 PsyTwin，开始您的心理健康之旅吧！	\N	t	2026-03-01 10:00:00	2026-03-08 15:10:54.278
notif_003	stu-xiaoming	POST	你的动态收到新评论	小晶评论了你的动态：加油！	/pages/post-detail/index?id=post_001	f	\N	2026-03-08 15:10:54.278
\.


--
-- Data for Name: students; Type: TABLE DATA; Schema: public; Owner: psytwin
--

COPY public.students (id, name, student_no, class_name, faculty_id, gender, birth_date, mbti, risk_level, created_at, updated_at, avatar, badges, last_login_at, nickname, password_hash, phone, role, settings, stats, status, join_date) FROM stdin;
stu-wuzhiyuan	吴志远	2024011	大数据2502	fac-data	男	2006-03-01 00:00:00	ISTJ	HIGH	2026-03-06 14:38:40.626	2026-03-10 15:33:20.645	\N	\N	\N	\N	$2b$10$GKuYCR9Ab5/MDTPNLw3JAOe/NqoEtpdCXTNwVWGXstKYa4RibPkAa	13800138019	student	\N	\N	ACTIVE	2024-01-01 00:00:00
stu-zhouhangyu	周航宇	2024012	虚拟2503	fac-vr	男	2006-03-01 00:00:00	ENTP	MEDIUM	2026-03-06 14:38:40.628	2026-03-10 15:33:20.661	\N	\N	\N	\N	$2b$10$GKuYCR9Ab5/MDTPNLw3JAOe/NqoEtpdCXTNwVWGXstKYa4RibPkAa	13800138026	student	\N	\N	ACTIVE	2024-11-01 00:00:00
stu-wangli	王丽	2023006	大数据2502	fac-data	男	2004-12-01 00:00:00	ISTJ	MEDIUM	2026-03-08 15:10:02.024	2026-03-10 15:33:20.638		[]	\N	匿名的你	$2b$10$GKuYCR9Ab5/MDTPNLw3JAOe/NqoEtpdCXTNwVWGXstKYa4RibPkAa	13800138007	student	\N	{"totalMinutes": 150, "vrSessionCount": 1, "assessmentCount": 4, "counselingCount": 2}	ACTIVE	2023-09-01 00:00:00
stu-liulian	张茶	2023004	信安2401	fac-cyber	女	2005-01-08 00:00:00	ESTJ	LOW	2026-03-08 15:10:02.016	2026-03-10 15:33:20.626	https://picsum.photos/80/80?random=5	[]	\N	江南茶	$2b$10$GKuYCR9Ab5/MDTPNLw3JAOe/NqoEtpdCXTNwVWGXstKYa4RibPkAa	13800138005	student	\N	{"totalMinutes": 90, "vrSessionCount": 1, "assessmentCount": 3, "counselingCount": 1}	ACTIVE	2023-09-01 00:00:00
stu-liusiyuan	刘思远	2024005	数媒2401	fac-dm	男	2006-03-01 00:00:00	INFJ	MEDIUM	2026-03-06 14:38:40.62	2026-03-10 15:33:20.629	\N	\N	\N	\N	$2b$10$GKuYCR9Ab5/MDTPNLw3JAOe/NqoEtpdCXTNwVWGXstKYa4RibPkAa	13800138013	student	\N	\N	ACTIVE	2024-05-01 00:00:00
stu-zhangmingyuan	张明远	2024001	网络2401	fac-cyber	男	2006-03-01 00:00:00	INTP	HIGH	2026-03-06 14:38:40.624	2026-03-10 15:33:20.653	\N	\N	\N	\N	$2b$10$GKuYCR9Ab5/MDTPNLw3JAOe/NqoEtpdCXTNwVWGXstKYa4RibPkAa	13800138022	student	\N	\N	ACTIVE	2024-02-01 00:00:00
stu-zhangyu	张宇	2025030	大数据2502	fac-data	男	2006-03-01 00:00:00	INTJ	LOW	2026-03-06 14:38:40.616	2026-03-10 15:33:20.654	\N	\N	\N	\N	$2b$10$GKuYCR9Ab5/MDTPNLw3JAOe/NqoEtpdCXTNwVWGXstKYa4RibPkAa	13800138023	student	\N	\N	ACTIVE	2024-05-01 00:00:00
stu-wangmang	李强	2023001	软件2302	fac-soft	男	2004-06-15 00:00:00	ESTJ	LOW	2026-03-08 15:10:02.011	2026-03-10 15:33:20.639	https://picsum.photos/80/80?random=4	[]	\N	阿强	$2b$10$GKuYCR9Ab5/MDTPNLw3JAOe/NqoEtpdCXTNwVWGXstKYa4RibPkAa	13800138004	student	\N	{"totalMinutes": 60, "vrSessionCount": 3, "assessmentCount": 1, "counselingCount": 0}	ACTIVE	2023-09-01 00:00:00
stu-liweimin	李伟民	2024017	软件2401	fac-soft	男	2006-10-02 00:00:00	ISTJ	MEDIUM	2026-03-07 14:07:44.062	2026-03-10 15:33:20.631	\N	\N	\N	\N	$2b$10$GKuYCR9Ab5/MDTPNLw3JAOe/NqoEtpdCXTNwVWGXstKYa4RibPkAa	13800138014	student	\N	\N	ACTIVE	2024-11-01 00:00:00
stu-zhengjiawen	郑家问	2023003	虚拟2301	fac-vr	女	2004-11-10 00:00:00	ESTJ	MEDIUM	2026-03-08 15:10:02.007	2026-03-10 15:33:20.657		[]	\N	匿名的你	$2b$10$GKuYCR9Ab5/MDTPNLw3JAOe/NqoEtpdCXTNwVWGXstKYa4RibPkAa	13800138003	student	\N	{"totalMinutes": 50, "vrSessionCount": 0, "assessmentCount": 2, "counselingCount": 1}	ACTIVE	2023-09-01 00:00:00
stu-zhaotianyu	赵天宇	2024004	信安2401	fac-cyber	男	2006-03-01 00:00:00	INFP	HIGH	2026-03-06 14:38:40.63	2026-03-10 15:33:20.656	\N	\N	\N	\N	$2b$10$GKuYCR9Ab5/MDTPNLw3JAOe/NqoEtpdCXTNwVWGXstKYa4RibPkAa	13800138024	student	\N	\N	ACTIVE	2024-05-01 00:00:00
stu-zhengkai	郑凯	2024021	虚拟2501	fac-vr	男	2006-02-01 00:00:00	INTJ	HIGH	2026-03-07 14:07:44.07	2026-03-10 15:33:20.659	\N	\N	\N	\N	$2b$10$GKuYCR9Ab5/MDTPNLw3JAOe/NqoEtpdCXTNwVWGXstKYa4RibPkAa	13800138025	student	\N	\N	ACTIVE	2024-12-01 00:00:00
stu-mengfei	王阳光	2023005	虚拟2501	fac-vr	女	2004-08-22 00:00:00	ESTJ	LOW	2026-03-08 15:10:02.02	2026-03-10 15:33:20.632	https://picsum.photos/80/80?random=7	[]	\N	阳光少女	$2b$10$GKuYCR9Ab5/MDTPNLw3JAOe/NqoEtpdCXTNwVWGXstKYa4RibPkAa	13800138006	student	\N	{"totalMinutes": 120, "vrSessionCount": 4, "assessmentCount": 2, "counselingCount": 0}	ACTIVE	2023-09-01 00:00:00
stu-sunxiaoxiao	孙晓晓	2024018	数媒2402	fac-dm	女	2006-01-11 00:00:00	INFP	HIGH	2026-03-07 14:07:44.065	2026-03-10 15:33:20.634	\N	\N	\N	\N	$2b$10$GKuYCR9Ab5/MDTPNLw3JAOe/NqoEtpdCXTNwVWGXstKYa4RibPkAa	13800138015	student	\N	\N	ACTIVE	2024-12-01 00:00:00
stu-xiaojing	小晶	2023002	软件2302	fac-soft	女	2005-03-20 00:00:00	ESTJ	LOW	2026-03-08 15:10:02.002	2026-03-10 15:33:20.646	https://picsum.photos/80/80?random=1	[]	\N	小晶	$2b$10$GKuYCR9Ab5/MDTPNLw3JAOe/NqoEtpdCXTNwVWGXstKYa4RibPkAa	13800138002	student	\N	{"totalMinutes": 45, "vrSessionCount": 2, "assessmentCount": 1, "counselingCount": 0}	ACTIVE	2023-09-01 00:00:00
stu-wangyuyan	王语嫣	2024016	网络2401	fac-cyber	男	2006-03-01 00:00:00	ENFJ	MEDIUM	2026-03-06 14:38:40.636	2026-03-10 15:33:20.641	\N	\N	\N	\N	$2b$10$GKuYCR9Ab5/MDTPNLw3JAOe/NqoEtpdCXTNwVWGXstKYa4RibPkAa	13800138017	student	\N	\N	ACTIVE	2024-12-01 00:00:00
stu-wuting	吴婷	2024020	大数据2501	fac-data	男	2006-10-08 00:00:00	ENFP	MEDIUM	2026-03-07 14:07:44.068	2026-03-10 15:33:20.643	\N	\N	\N	\N	$2b$10$GKuYCR9Ab5/MDTPNLw3JAOe/NqoEtpdCXTNwVWGXstKYa4RibPkAa	13800138018	student	\N	\N	ACTIVE	2024-02-01 00:00:00
stu-xiaoli	萧丽	2024026	虚拟2502	fac-vr	男	2006-05-23 00:00:00	ESFJ	LOW	2026-03-07 14:07:44.081	2026-03-10 15:33:20.648	\N	\N	\N	\N	$2b$10$GKuYCR9Ab5/MDTPNLw3JAOe/NqoEtpdCXTNwVWGXstKYa4RibPkAa	13800138020	student	\N	\N	ACTIVE	2024-08-01 00:00:00
stu-zhoujian	周健	2024019	网络2402	fac-cyber	女	2006-08-19 00:00:00	ESTJ	LOW	2026-03-07 14:07:44.067	2026-03-10 15:33:20.663	\N	\N	\N	\N	$2b$10$GKuYCR9Ab5/MDTPNLw3JAOe/NqoEtpdCXTNwVWGXstKYa4RibPkAa	13800138027	student	\N	\N	ACTIVE	2024-05-01 00:00:00
stu-chenjing	陈静	2024024	信息2401	fac-info	女	2006-11-21 00:00:00	INFJ	HIGH	2026-03-07 14:07:44.076	2026-03-10 15:33:20.615	\N	\N	\N	\N	$2b$10$GKuYCR9Ab5/MDTPNLw3JAOe/NqoEtpdCXTNwVWGXstKYa4RibPkAa	13800138008	student	\N	\N	ACTIVE	2024-02-01 00:00:00
stu-chenyuqing	陈雨晴	2024006	软件2402	fac-soft	男	2006-03-01 00:00:00	ISFJ	HIGH	2026-03-06 14:38:40.622	2026-03-10 15:33:20.619	\N	\N	\N	\N	$2b$10$GKuYCR9Ab5/MDTPNLw3JAOe/NqoEtpdCXTNwVWGXstKYa4RibPkAa	13800138009	student	\N	\N	ACTIVE	2024-03-01 00:00:00
stu-fengtao	冯涛	2024023	软件2403	fac-soft	男	2006-06-11 00:00:00	ENTP	LOW	2026-03-07 14:07:44.074	2026-03-10 15:33:20.621	\N	\N	\N	\N	$2b$10$GKuYCR9Ab5/MDTPNLw3JAOe/NqoEtpdCXTNwVWGXstKYa4RibPkAa	13800138010	student	\N	\N	ACTIVE	2024-05-01 00:00:00
stu-huangsimeng	黄思萌	2024013	软件2402	fac-soft	男	2006-03-01 00:00:00	ESFJ	MEDIUM	2026-03-06 14:38:40.632	2026-03-10 15:33:20.622	\N	\N	\N	\N	$2b$10$GKuYCR9Ab5/MDTPNLw3JAOe/NqoEtpdCXTNwVWGXstKYa4RibPkAa	13800138011	student	\N	\N	ACTIVE	2024-03-01 00:00:00
stu-linzhihao	林志豪	2024014	大数据2502	fac-data	男	2006-03-01 00:00:00	ESTP	LOW	2026-03-06 14:38:40.634	2026-03-10 15:33:20.624	\N	\N	\N	\N	$2b$10$GKuYCR9Ab5/MDTPNLw3JAOe/NqoEtpdCXTNwVWGXstKYa4RibPkAa	13800138012	student	\N	\N	ACTIVE	2024-11-01 00:00:00
stu-wangfang	王芳	2024022	信安2402	fac-cyber	女	2006-10-15 00:00:00	ISFP	MEDIUM	2026-03-07 14:07:44.072	2026-03-10 15:33:20.636	\N	\N	\N	\N	$2b$10$GKuYCR9Ab5/MDTPNLw3JAOe/NqoEtpdCXTNwVWGXstKYa4RibPkAa	13800138016	student	\N	\N	ACTIVE	2024-12-01 00:00:00
stu-yangbo	杨波	2024025	数媒2403	fac-dm	男	2006-05-13 00:00:00	ESTP	MEDIUM	2026-03-07 14:07:44.079	2026-03-10 15:33:20.651	\N	\N	\N	\N	$2b$10$GKuYCR9Ab5/MDTPNLw3JAOe/NqoEtpdCXTNwVWGXstKYa4RibPkAa	13800138021	student	\N	\N	ACTIVE	2024-02-01 00:00:00
stu-xiaoming	小明同学	2023007	软件2301	fac-soft	男	2004-09-15 00:00:00	INTJ	LOW	2026-03-08 15:10:01.994	2026-03-11 05:33:11.39	https://picsum.photos/200/200?random=200	[{"id": 1, "desc": "完成首次心理咨询", "icon": "chat", "name": "初次咨询", "earned": true, "earnedAt": "2026-01-10T10:00:00Z"}, {"id": 2, "desc": "体验 VR 心理训练 5 次", "icon": "desktop", "name": "VR 探索者", "earned": true, "earnedAt": "2026-02-15T14:30:00Z"}, {"id": 3, "desc": "连续记录心情 7 天", "icon": "calendar", "name": "坚持打卡", "earned": true, "earnedAt": "2026-02-20T08:00:00Z"}, {"id": 4, "desc": "完成 5 次心理咨询", "icon": "star", "name": "心理达人", "earned": false}]	2026-03-11 05:33:11.389	小明	$2b$10$GKuYCR9Ab5/MDTPNLw3JAOe/NqoEtpdCXTNwVWGXstKYa4RibPkAa	13800138001	student	{"theme": "light", "privacy": {"anonymousDefault": false}, "notification": true}	{"totalMinutes": 185, "lastActiveDate": "2026-03-01", "vrSessionCount": 5, "assessmentCount": 3, "counselingCount": 2}	ACTIVE	2023-09-01 00:00:00
\.


--
-- Data for Name: sync_logs; Type: TABLE DATA; Schema: public; Owner: psytwin
--

COPY public.sync_logs (id, task_id, started_at, ended_at, status, data_size, record_count, error_msg) FROM stdin;
\.


--
-- Data for Name: sync_tasks; Type: TABLE DATA; Schema: public; Owner: psytwin
--

COPY public.sync_tasks (id, name, data_source_id, schedule, enabled, status, last_sync_at, next_sync_at, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: system_config; Type: TABLE DATA; Schema: public; Owner: psytwin
--

COPY public.system_config (id, key, value, description, updated_at, updated_by) FROM stdin;
\.


--
-- Data for Name: teachers; Type: TABLE DATA; Schema: public; Owner: psytwin
--

COPY public.teachers (id, teacher_id, name, phone, avatar, department, title, qualifications, work_stats, badges, created_at, updated_at, last_login_at, password_hash, status, role, nickname) FROM stdin;
t002	T0002	李老师	13800000002	https://picsum.photos/80/80?random=6	学生工作处	心理咨询师	{国家三级心理咨询师}	{"totalHours": 210, "totalCounseling": 156, "satisfactionRate": 4.7, "thisMonthCounseling": 18}	[]	2026-03-07 05:10:54.277	2026-03-11 20:10:30.162	\N	$2b$10$5jFud9s3oa0glI7lL86M.ed4mXSlRuYTKEBzeDhbyOGofAiV0AoYS	ACTIVE	COUNSELOR	大熊
t003	T0003	李心理	13800138008	https://picsum.photos/80/80?random=6	心理健康中心	注册心理师	{注册心理师,国家三级心理咨询师}	{"totalHours": 210, "totalCounseling": 156, "satisfactionRate": 4.7, "thisMonthCounseling": 18}	[]	2026-03-08 15:10:02.069	2026-03-10 10:26:02.683	\N	$2b$10$hashedpassword	ACTIVE	COUNSELOR	心理老师李
t001	T0001	王老师	13800000001	https://picsum.photos/80/80?random=6	心理咨询中心	高级心理咨询师	{国家二级心理咨询师,沙盘游戏治疗师}	{"totalHours": 210, "totalCounseling": 156, "satisfactionRate": 4.7, "thisMonthCounseling": 18}	[]	2026-03-07 05:10:54.27	2026-03-11 20:10:30.148	\N	$2b$10$5jFud9s3oa0glI7lL86M.ed4mXSlRuYTKEBzeDhbyOGofAiV0AoYS	ACTIVE	COUNSELOR	小鱼
\.


--
-- Data for Name: timeline_events; Type: TABLE DATA; Schema: public; Owner: psytwin
--

COPY public.timeline_events (id, student_id, date, title, description, status, created_at, updated_at) FROM stdin;
te-stu-zhangyu-202510	stu-zhangyu	2025年10月	VR脱敏训练（第一期）	完成社交焦虑VR脱敏训练6次，焦虑指数下降22%	success	2026-03-06 14:38:41.15	2026-03-07 09:23:48.013
te-stu-zhangyu-20261	stu-zhangyu	2026年1月	期末复查	各项指标恢复正常，情绪稳定性提升18%	success	2026-03-06 14:38:41.152	2026-03-07 09:23:48.015
te-stu-zhangyu-20262	stu-zhangyu	2026年2月	新学期跟踪中	持续监测中，当前状态良好	active	2026-03-06 14:38:41.154	2026-03-07 09:23:48.016
te-stu-liusiyuan-20259	stu-liusiyuan	2025年9月	入学普测完成	SCL-90测评显示轻度焦虑倾向	warning	2026-03-06 14:38:41.155	2026-03-07 09:23:48.018
te-stu-liusiyuan-202510	stu-liusiyuan	2025年10月	VR正念训练	开始VR正念冥想训练，睡眠质量改善	success	2026-03-06 14:38:41.156	2026-03-07 09:23:48.019
te-stu-liusiyuan-202512	stu-liusiyuan	2025年12月	定期咨询面谈	与咨询师建立信任关系，情绪管理能力提升	success	2026-03-06 14:38:41.158	2026-03-07 09:23:48.021
te-stu-liusiyuan-20262	stu-liusiyuan	2026年2月	复查评估	焦虑水平显著下降，继续保持	success	2026-03-06 14:38:41.159	2026-03-07 09:23:48.022
te-stu-chenyuqing-20259	stu-chenyuqing	2025年9月	入学普测完成	测评显示抑郁高风险，触发预警	warning	2026-03-06 14:38:41.161	2026-03-07 09:23:48.024
te-stu-chenyuqing-202510	stu-chenyuqing	2025年10月	预警响应	辅导员关注，转介至心理咨询中心	warning	2026-03-06 14:38:41.162	2026-03-07 09:23:48.025
te-stu-chenyuqing-202511	stu-chenyuqing	2025年11月	初次评估	建立干预方案，开始CBT疗法	success	2026-03-06 14:38:41.164	2026-03-07 09:23:48.026
te-stu-chenyuqing-202512	stu-chenyuqing	2025年12月	定期咨询	认知重构进展顺利，抑郁症状减轻	success	2026-03-06 14:38:41.165	2026-03-07 09:23:48.028
te-stu-chenyuqing-20261	stu-chenyuqing	2026年1月	复查评估	抑郁风险评估降低至中风险	success	2026-03-06 14:38:41.166	2026-03-07 09:23:48.029
te-stu-chenyuqing-20262	stu-chenyuqing	2026年2月	持续跟踪	继续保持CBT疗法，状态稳定	active	2026-03-06 14:38:41.168	2026-03-07 09:23:48.031
te-stu-zhangmingyuan-20259	stu-zhangmingyuan	2025年9月	入学普测完成	各项指标正常，心理素质良好	success	2026-03-06 14:38:41.169	2026-03-07 09:23:48.032
te-stu-zhangmingyuan-202511	stu-zhangmingyuan	2025年11月	团体辅导	参加人际沟通团体辅导，社交能力提升	success	2026-03-06 14:38:41.171	2026-03-07 09:23:48.033
te-stu-zhangmingyuan-20262	stu-zhangmingyuan	2026年2月	定期跟踪	状态保持良好，无需特殊干预	active	2026-03-06 14:38:41.172	2026-03-07 09:23:48.035
te-stu-wuzhiyuan-20259	stu-wuzhiyuan	2025年9月	入学普测完成	测评显示社交回避倾向	warning	2026-03-06 14:38:41.174	2026-03-07 09:23:48.036
te-stu-wuzhiyuan-202510	stu-wuzhiyuan	2025年10月	宿舍关系问题	室友反馈沟通困难，辅导员介入	warning	2026-03-06 14:38:41.176	2026-03-07 09:23:48.037
te-stu-wuzhiyuan-202511	stu-wuzhiyuan	2025年11月	VR社交训练	开始VR社交焦虑脱敏训练	success	2026-03-06 14:38:41.177	2026-03-07 09:23:48.039
te-stu-wuzhiyuan-202512	stu-wuzhiyuan	2025年12月	团体辅导	参加社交技能团体辅导	success	2026-03-06 14:38:41.178	2026-03-07 09:23:48.041
te-stu-wuzhiyuan-20262	stu-wuzhiyuan	2026年2月	持续改善	社交互动有所改善，继续跟踪	active	2026-03-06 14:38:41.18	2026-03-07 09:23:48.042
te-stu-zhouhangyu-20259	stu-zhouhangyu	2025年9月	入学普测完成	各项指标优秀，心理素质突出	success	2026-03-06 14:38:41.181	2026-03-07 09:23:48.043
te-stu-zhaotianyu-202510	stu-zhaotianyu	2025年10月	情绪波动预警	多次情绪爆发，触发预警	warning	2026-03-06 14:38:41.188	2026-03-07 09:23:48.05
te-stu-zhaotianyu-202511	stu-zhaotianyu	2025年11月	危机干预	情绪危机干预，建立安全计划	success	2026-03-06 14:38:41.189	2026-03-07 09:23:48.051
te-stu-zhaotianyu-202512	stu-zhaotianyu	2025年12月	定期咨询	情绪调节能力有所改善	success	2026-03-06 14:38:41.191	2026-03-07 09:23:48.052
te-stu-zhaotianyu-20262	stu-zhaotianyu	2026年2月	持续跟踪	情绪管理仍需关注	active	2026-03-06 14:38:41.192	2026-03-07 09:23:48.054
te-stu-huangsimeng-20259	stu-huangsimeng	2025年9月	入学普测完成	各项指标正常	success	2026-03-06 14:38:41.193	2026-03-07 09:23:48.055
te-stu-huangsimeng-202512	stu-huangsimeng	2025年12月	考试压力	期末考试压力大，参加减压活动	warning	2026-03-06 14:38:41.195	2026-03-07 09:23:48.058
te-stu-huangsimeng-20262	stu-huangsimeng	2026年2月	状态恢复	假期调整，状态恢复良好	success	2026-03-06 14:38:41.197	2026-03-07 09:23:48.059
te-stu-linzhihao-20259	stu-linzhihao	2025年9月	入学普测完成	各项指标优秀	success	2026-03-06 14:38:41.198	2026-03-07 09:23:48.061
te-stu-linzhihao-202511	stu-linzhihao	2025年11月	运动减压	参加体育活动和正念训练	success	2026-03-06 14:38:41.2	2026-03-07 09:23:48.062
te-stu-linzhihao-20262	stu-linzhihao	2026年2月	保持健康	身心状态良好	active	2026-03-06 14:38:41.202	2026-03-07 09:23:48.063
te-stu-wangyuyan-20259	stu-wangyuyan	2025年9月	入学普测完成	轻度社交焦虑	warning	2026-03-06 14:38:41.203	2026-03-07 09:23:48.065
te-stu-wangyuyan-202510	stu-wangyuyan	2025年10月	VR训练	开始VR社交焦虑脱敏训练	success	2026-03-06 14:38:41.204	2026-03-07 09:23:48.066
te-stu-wangyuyan-202512	stu-wangyuyan	2025年12月	改善明显	社交焦虑显著减轻	success	2026-03-06 14:38:41.206	2026-03-07 09:23:48.067
te-stu-wangyuyan-20262	stu-wangyuyan	2026年2月	巩固训练	继续VR训练，巩固效果	active	2026-03-06 14:38:41.207	2026-03-07 09:23:48.069
te-stu-liweimin-20259	stu-liweimin	2025年9月	入学普测完成	测评显示轻度学业压力	warning	2026-03-07 14:48:47.177	2026-03-07 14:48:47.177
te-stu-sunxiaoxiao-20259	stu-sunxiaoxiao	2025年9月	入学普测完成	测评显示情绪低落	warning	2026-03-07 14:48:47.179	2026-03-07 14:48:47.179
te-stu-sunxiaoxiao-202510	stu-sunxiaoxiao	2025年10月	心理咨询	开始定期心理咨询	success	2026-03-07 14:48:47.181	2026-03-07 14:48:47.181
te-stu-zhoujian-20259	stu-zhoujian	2025年9月	入学普测完成	各项指标正常	success	2026-03-07 14:48:47.184	2026-03-07 14:48:47.184
te-stu-wuting-20259	stu-wuting	2025年9月	入学普测完成	各项指标正常	success	2026-03-07 14:48:47.186	2026-03-07 14:48:47.186
te-stu-zhengkai-20259	stu-zhengkai	2025年9月	入学普测完成	测评显示人际关系困扰	warning	2026-03-07 14:48:47.188	2026-03-07 14:48:47.188
te-stu-wangfang-20259	stu-wangfang	2025年9月	入学普测完成	各项指标正常	success	2026-03-07 14:48:47.19	2026-03-07 14:48:47.19
te-stu-fengtao-20259	stu-fengtao	2025年9月	入学普测完成	各项指标优秀	success	2026-03-07 14:48:47.192	2026-03-07 14:48:47.192
te-stu-yangbo-20259	stu-yangbo	2025年9月	入学普测完成	各项指标正常	success	2026-03-07 14:48:47.196	2026-03-07 14:48:47.196
te-stu-xiaoli-20259	stu-xiaoli	2025年9月	入学普测完成	各项指标优秀	success	2026-03-07 14:48:47.197	2026-03-07 14:48:47.197
te-stu-zhangyu-202511-wsbv1	stu-zhangyu	2025年11月	心理委员培训	参加班级心理委员培训，学习心理健康知识和危机识别技能，考核优秀	success	2026-03-07 15:21:23.168	2026-03-07 15:21:23.168
te-stu-zhangyu-20259	stu-zhangyu	2025年9月	入学普测完成	SCL-90/SDS/SAS三量表联合筛查，评分正常范围	success	2026-03-06 14:38:41.149	2026-03-07 09:23:48.011
te-stu-zhouhangyu-202510	stu-zhouhangyu	2025年10月	心理委员培训	参加班级心理委员培训	success	2026-03-06 14:38:41.183	2026-03-07 09:23:48.045
te-stu-zhouhangyu-20262	stu-zhouhangyu	2026年2月	健康监测	状态保持良好	active	2026-03-06 14:38:41.184	2026-03-07 09:23:48.046
te-stu-zhaotianyu-20259	stu-zhaotianyu	2025年9月	入学普测完成	测评显示情绪不稳定	warning	2026-03-06 14:38:41.186	2026-03-07 09:23:48.047
te-stu-zhangyu-20261-62dw9	stu-zhangyu	2026年1月	期末心理复查	期末心理健康复查，各项指标持续向好，情绪稳定性提升18%，继续保持	success	2026-03-07 15:21:23.171	2026-03-07 15:21:23.171
te-stu-zhangyu-20262-ehukb	stu-zhangyu	2026年2月	新学期心理健康跟踪	新学期心理状态评估良好，作为心理委员协助辅导员开展班级心理健康活动	active	2026-03-07 15:21:23.172	2026-03-07 15:21:23.172
te-stu-liusiyuan-202510-43zsf	stu-liusiyuan	2025年10月	VR正念冥想训练	开始VR正念冥想放松训练，每周2次，睡眠质量从入睡困难改善为正常	success	2026-03-07 15:21:23.176	2026-03-07 15:21:23.176
te-stu-liusiyuan-202511-rzwtg	stu-liusiyuan	2025年11月	定期咨询面谈	与心理咨询师建立信任关系，情绪管理能力显著提升，焦虑评分降至42	success	2026-03-07 15:21:23.178	2026-03-07 15:21:23.178
te-stu-liusiyuan-202512-hnirh	stu-liusiyuan	2025年12月	焦虑症状改善	期末评估显示焦虑症状明显改善，社交活动参与度提高，宿舍关系融洽	success	2026-03-07 15:21:23.181	2026-03-07 15:21:23.181
te-stu-liusiyuan-20262-pgli8	stu-liusiyuan	2026年2月	持续跟踪评估	新学期心理状态稳定，焦虑症状基本消除，建议继续保持正念练习习惯	active	2026-03-07 15:21:23.183	2026-03-07 15:21:23.183
te-stu-chenyuqing-20259-c9ycc	stu-chenyuqing	2025年9月	入学普测预警	测评显示抑郁高风险，SDS得分68，PHQ-9得分15，触发一级预警机制	warning	2026-03-07 15:21:23.184	2026-03-07 15:21:23.184
te-stu-chenyuqing-202510-9icbq	stu-chenyuqing	2025年10月	预警响应与转介	辅导员约谈并转介至心理咨询中心，建立危机档案，制定干预计划	warning	2026-03-07 15:21:23.186	2026-03-07 15:21:23.186
te-stu-chenyuqing-202511-icq3i	stu-chenyuqing	2025年11月	初次心理评估	专业心理评估完成，诊断为轻度抑郁，建立干预方案，开始CBT认知行为疗法	success	2026-03-07 15:21:23.189	2026-03-07 15:21:23.189
te-stu-chenyuqing-202512-730ey	stu-chenyuqing	2025年12月	CBT疗法进展	认知重构进展顺利，抑郁症状明显减轻，SDS得分降至52，情绪趋于稳定	success	2026-03-07 15:21:23.191	2026-03-07 15:21:23.191
te-stu-chenyuqing-20262-oqek5	stu-chenyuqing	2026年2月	持续治疗与康复	抑郁风险评估降级至中风险，继续CBT治疗，建议配合运动和社交活动	active	2026-03-07 15:21:23.193	2026-03-07 15:21:23.193
te-stu-zhangmingyuan-202510-i601m	stu-zhangmingyuan	2025年10月	参与心理讲座	参加大学生心理健康教育讲座，学习压力管理和情绪调节技巧	success	2026-03-07 15:21:23.196	2026-03-07 15:21:23.196
te-stu-zhangmingyuan-202511-fra1x	stu-zhangmingyuan	2025年11月	团体辅导体验	参加人际沟通团体辅导活动，社交能力提升，结识新朋友	success	2026-03-07 15:21:23.198	2026-03-07 15:21:23.198
te-stu-zhangmingyuan-202512-sya4k	stu-zhangmingyuan	2025年12月	心理志愿者活动	参与心理健康宣传志愿者活动，协助发放心理健康手册，表现积极	success	2026-03-07 15:21:23.2	2026-03-07 15:21:23.2
te-stu-zhangmingyuan-20262-wbh3j	stu-zhangmingyuan	2026年2月	新学期目标设定	制定新学期心理健康目标，计划参加更多心理成长活动，保持积极心态	active	2026-03-07 15:21:23.202	2026-03-07 15:21:23.202
te-stu-wuzhiyuan-20259-kex8e	stu-wuzhiyuan	2025年9月	入学普测预警	测评显示社交回避倾向明显，社交焦虑量表得分62，回避行为较多	warning	2026-03-07 15:21:23.204	2026-03-07 15:21:23.204
te-stu-wuzhiyuan-202510-ybvz1	stu-wuzhiyuan	2025年10月	VR社交训练开始	开始VR社交焦虑脱敏训练，从虚拟场景逐步适应社交互动，建立信心	success	2026-03-07 15:21:23.206	2026-03-07 15:21:23.206
te-stu-wuzhiyuan-202511-qun55	stu-wuzhiyuan	2025年11月	团体辅导参与	参加社交技能训练小组，学习社交技巧，与组员建立初步信任关系	success	2026-03-07 15:21:23.208	2026-03-07 15:21:23.208
te-stu-wuzhiyuan-202512-y1zi0	stu-wuzhiyuan	2025年12月	社交行为改善	主动参加班级活动2次，课堂发言次数增加，社交焦虑评分降至45	success	2026-03-07 15:21:23.21	2026-03-07 15:21:23.21
te-stu-wuzhiyuan-20262-pbzbn	stu-wuzhiyuan	2026年2月	持续康复训练	继续坚持社交技能练习，参加社团招新活动，社交能力持续改善中	active	2026-03-07 15:21:23.212	2026-03-07 15:21:23.212
te-stu-zhouhangyu-20259-nx4qb	stu-zhouhangyu	2025年9月	入学普测优秀	各项指标优秀，心理素质突出，综合评分79分，适应能力强	success	2026-03-07 15:21:23.214	2026-03-07 15:21:23.214
te-stu-zhouhangyu-202510-3tglj	stu-zhouhangyu	2025年10月	心理委员选拔	被选拔为班级心理委员，协助辅导员开展心理健康教育工作	success	2026-03-07 15:21:23.216	2026-03-07 15:21:23.216
te-stu-zhouhangyu-202512-6wv52	stu-zhouhangyu	2025年12月	心理健康活动组织	成功组织班级心理健康主题活动，获得老师和同学好评	success	2026-03-07 15:21:23.218	2026-03-07 15:21:23.218
te-stu-zhouhangyu-20262-wiwri	stu-zhouhangyu	2026年2月	新学期规划	继续担任心理委员，计划开展更多心理健康宣传活动	active	2026-03-07 15:21:23.22	2026-03-07 15:21:23.22
te-stu-zhaotianyu-20259-s80wk	stu-zhaotianyu	2025年9月	入学普测预警	测评显示情绪不稳定，情绪波动大，易怒，情绪调节能力弱	warning	2026-03-07 15:21:23.222	2026-03-07 15:21:23.222
te-stu-zhaotianyu-202510-00g8w	stu-zhaotianyu	2025年10月	情绪危机干预	因与室友冲突引发情绪爆发，进行情绪危机干预，建立安全计划	warning	2026-03-07 15:21:23.223	2026-03-07 15:21:23.223
te-stu-zhaotianyu-202511-83dy4	stu-zhaotianyu	2025年11月	情绪管理训练	开始情绪管理技能训练，学习情绪识别和调节技巧，情绪稳定性提升	success	2026-03-07 15:21:23.228	2026-03-07 15:21:23.228
te-stu-zhaotianyu-202512-34f9r	stu-zhaotianyu	2025年12月	人际关系调解	辅导员协助调解宿舍人际关系，与室友达成和解，关系改善	success	2026-03-07 15:21:23.23	2026-03-07 15:21:23.23
te-stu-zhaotianyu-20262-6ggel	stu-zhaotianyu	2026年2月	持续情绪监控	情绪管理能力有所提升，建议继续参加情绪管理小组活动	active	2026-03-07 15:21:23.232	2026-03-07 15:21:23.232
te-stu-huangsimeng-202511-zvzjo	stu-huangsimeng	2025年11月	考试压力应对	期中考试压力大，参加压力管理工作坊，学习放松技巧	success	2026-03-07 15:21:23.236	2026-03-07 15:21:23.236
te-stu-huangsimeng-20261-a9b30	stu-huangsimeng	2026年1月	期末考试调整	运用学到的压力管理技巧，期末考试期间状态良好	success	2026-03-07 15:21:23.239	2026-03-07 15:21:23.239
te-stu-huangsimeng-20262-ssmdc	stu-huangsimeng	2026年2月	新学期适应	新学期适应良好，继续保持健康的生活方式	active	2026-03-07 15:21:23.241	2026-03-07 15:21:23.241
te-stu-linzhihao-20259-5ky5u	stu-linzhihao	2025年9月	入学普测优秀	各项指标优秀，心理素质极佳，综合评分83分，各项指标均衡	success	2026-03-07 15:21:23.243	2026-03-07 15:21:23.243
te-stu-linzhihao-202510-7bjw7	stu-linzhihao	2025年10月	运动减压活动	积极参加体育锻炼和正念训练，身心状态良好	success	2026-03-07 15:21:23.245	2026-03-07 15:21:23.245
te-stu-linzhihao-202512-w1qd8	stu-linzhihao	2025年12月	心理韧性提升	面对学业挑战表现出良好的心理韧性，积极应对困难	success	2026-03-07 15:21:23.247	2026-03-07 15:21:23.247
te-stu-linzhihao-20262-w28gt	stu-linzhihao	2026年2月	持续优秀表现	继续保持优秀的心理状态，成为同学们学习的榜样	active	2026-03-07 15:21:23.249	2026-03-07 15:21:23.249
te-stu-wangyuyan-20259-w7c90	stu-wangyuyan	2025年9月	入学普测预警	测评显示轻度社交焦虑，社交回避行为较多，自信心不足	warning	2026-03-07 15:21:23.251	2026-03-07 15:21:23.251
te-stu-wangyuyan-202510-a3m9y	stu-wangyuyan	2025年10月	VR社交训练	开始VR社交焦虑脱敏训练，逐步建立社交信心	success	2026-03-07 15:21:23.253	2026-03-07 15:21:23.253
te-stu-wangyuyan-202511-oeb52	stu-wangyuyan	2025年11月	团体辅导参与	参加自信心提升小组，通过角色扮演练习社交技能	success	2026-03-07 15:21:23.255	2026-03-07 15:21:23.255
te-stu-wangyuyan-202512-djzu0	stu-wangyuyan	2025年12月	社交焦虑改善	主动参加班级聚会2次，社交焦虑评分从62降至48，改善明显	success	2026-03-07 15:21:23.257	2026-03-07 15:21:23.257
te-stu-wangyuyan-20262-wqi22	stu-wangyuyan	2026年2月	持续练习巩固	继续坚持社交技能练习，参加社团活动，自信心逐步建立	active	2026-03-07 15:21:23.259	2026-03-07 15:21:23.259
te-stu-liweimin-20259-ahoot	stu-liweimin	2025年9月	入学普测预警	测评显示轻度学业压力，对未来规划感到迷茫，存在焦虑情绪	warning	2026-03-07 15:21:23.261	2026-03-07 15:21:23.261
te-stu-liweimin-202510-ornoz	stu-liweimin	2025年10月	学业规划咨询	参加学业规划辅导，明确学习目标，制定学习计划	success	2026-03-07 15:21:23.263	2026-03-07 15:21:23.263
te-stu-liweimin-202511-1r8xu	stu-liweimin	2025年11月	时间管理工作坊	参加时间管理培训，学习效率提升，压力感减轻	success	2026-03-07 15:21:23.265	2026-03-07 15:21:23.265
te-stu-liweimin-20261-cyhe8	stu-liweimin	2026年1月	压力缓解显著	学业压力明显减轻，期末考试成绩理想，焦虑评分降至正常范围	success	2026-03-07 15:21:23.267	2026-03-07 15:21:23.267
te-stu-liweimin-20262-2q9oa	stu-liweimin	2026年2月	新学期展望	新学期目标明确，学习方法得当，心理状态稳定	active	2026-03-07 15:21:23.269	2026-03-07 15:21:23.269
te-stu-sunxiaoxiao-20259-0xq85	stu-sunxiaoxiao	2025年9月	入学普测预警	测评显示情绪低落，SDS得分65，存在轻度抑郁症状，需要关注	warning	2026-03-07 15:21:23.271	2026-03-07 15:21:23.271
te-stu-sunxiaoxiao-202510-vf9uk	stu-sunxiaoxiao	2025年10月	心理咨询开始	开始定期心理咨询，倾诉情绪困扰，建立治疗关系	success	2026-03-07 15:21:23.273	2026-03-07 15:21:23.273
te-stu-sunxiaoxiao-202511-gnqwe	stu-sunxiaoxiao	2025年11月	情绪日记记录	开始写情绪日记，学习识别和表达情绪，情绪觉察能力提升	success	2026-03-07 15:21:23.277	2026-03-07 15:21:23.277
te-stu-sunxiaoxiao-202512-skj0w	stu-sunxiaoxiao	2025年12月	情绪状态改善	抑郁症状有所改善，SDS得分降至55，情绪趋于稳定	success	2026-03-07 15:21:23.279	2026-03-07 15:21:23.279
te-stu-sunxiaoxiao-20262-eox9q	stu-sunxiaoxiao	2026年2月	持续心理咨询	继续心理咨询，情绪管理能力提升，建议保持定期咨询	active	2026-03-07 15:21:23.28	2026-03-07 15:21:23.28
te-stu-zhoujian-202511-tlrbt	stu-zhoujian	2025年11月	心理健康讲座	参加大学生心理健康讲座，学习心理健康知识	success	2026-03-07 15:21:23.284	2026-03-07 15:21:23.284
te-stu-zhoujian-20261-sd41n	stu-zhoujian	2026年1月	期末状态良好	期末复习期间状态良好，能够有效管理学习压力	success	2026-03-07 15:21:23.286	2026-03-07 15:21:23.286
te-stu-zhoujian-20262-yzeyi	stu-zhoujian	2026年2月	新学期适应	新学期适应良好，继续保持健康的心理状态	active	2026-03-07 15:21:23.288	2026-03-07 15:21:23.288
te-stu-wuting-202510-slvdx	stu-wuting	2025年10月	人际交往培训	参加人际交往技能培训，学习有效沟通技巧	success	2026-03-07 15:21:23.291	2026-03-07 15:21:23.291
te-stu-wuting-202511-jpf3q	stu-wuting	2025年11月	宿舍关系调解	主动参与宿舍关系建设，调解室友矛盾，宿舍氛围和谐	success	2026-03-07 15:21:23.293	2026-03-07 15:21:23.293
te-stu-wuting-202512-5ixd9	stu-wuting	2025年12月	社交能力提升	人际交往能力显著提升，朋友圈扩大，社交满意度提高	success	2026-03-07 15:21:23.295	2026-03-07 15:21:23.295
te-stu-wuting-20262-ajfdz	stu-wuting	2026年2月	继续成长	继续参加心理成长活动，保持积极的人际交往态度	active	2026-03-07 15:21:23.297	2026-03-07 15:21:23.297
te-stu-zhengkai-20259-zfp98	stu-zhengkai	2025年9月	入学普测预警	测评显示人际关系困扰，社交技能不足，存在感较低	warning	2026-03-07 15:21:23.299	2026-03-07 15:21:23.299
te-stu-zhengkai-202510-fy6on	stu-zhengkai	2025年10月	团体辅导开始	参加社交技能团体辅导，学习人际交往技巧	success	2026-03-07 15:21:23.301	2026-03-07 15:21:23.301
te-stu-zhengkai-202511-dbpvz	stu-zhengkai	2025年11月	小组活动参与	在小组活动中表现积极，与组员建立良好关系	success	2026-03-07 15:21:23.302	2026-03-07 15:21:23.302
te-stu-zhengkai-202512-aizzo	stu-zhengkai	2025年12月	关系改善显著	主动与同学交流增多，室友关系改善，不再感到孤独	success	2026-03-07 15:21:23.305	2026-03-07 15:21:23.305
te-stu-zhengkai-20262-gl4aa	stu-zhengkai	2026年2月	持续社交练习	继续练习社交技能，参加社团活动，扩大社交圈	active	2026-03-07 15:21:23.307	2026-03-07 15:21:23.307
te-stu-wangfang-202511-ib1mw	stu-wangfang	2025年11月	情绪管理工作坊	参加情绪管理工作坊，学习情绪调节技巧	success	2026-03-07 15:21:23.311	2026-03-07 15:21:23.311
te-stu-wangfang-202512-3pmv2	stu-wangfang	2025年12月	情绪调节改善	情绪管理能力提升，能够更好地应对压力和负面情绪	success	2026-03-07 15:21:23.313	2026-03-07 15:21:23.313
te-stu-wangfang-20261-3zdw3	stu-wangfang	2026年1月	期末平稳度过	期末复习期间情绪稳定，考试状态良好	success	2026-03-07 15:21:23.315	2026-03-07 15:21:23.315
te-stu-wangfang-20262-p25e8	stu-wangfang	2026年2月	继续保持	继续保持良好的情绪管理能力，新学期状态良好	active	2026-03-07 15:21:23.317	2026-03-07 15:21:23.317
te-stu-fengtao-20259-a8aqb	stu-fengtao	2025年9月	入学普测优秀	各项指标优秀，心理素质极佳，综合评分80分	success	2026-03-07 15:21:23.319	2026-03-07 15:21:23.319
te-stu-fengtao-202511-hngrs	stu-fengtao	2025年11月	心理健康活动	积极参加心理健康主题活动，表现活跃	success	2026-03-07 15:21:23.32	2026-03-07 15:21:23.32
te-stu-fengtao-20261-3f254	stu-fengtao	2026年1月	优秀表现持续	身心健康，学业成绩优秀，全面发展	success	2026-03-07 15:21:23.323	2026-03-07 15:21:23.323
te-stu-fengtao-20262-uiezq	stu-fengtao	2026年2月	新学期目标	继续保持健康状态，争取更大进步	active	2026-03-07 15:21:23.325	2026-03-07 15:21:23.325
te-stu-chenjing-20259-fl566	stu-chenjing	2025年9月	入学普测预警	测评显示睡眠问题严重，入睡困难，睡眠质量差，影响日间功能	warning	2026-03-07 15:21:23.326	2026-03-07 15:21:23.326
te-stu-chenjing-202510-o20ca	stu-chenjing	2025年10月	睡眠咨询开始	开始睡眠问题咨询，学习睡眠卫生知识，建立良好睡眠习惯	success	2026-03-07 15:21:23.328	2026-03-07 15:21:23.328
te-stu-chenjing-202511-vnzp6	stu-chenjing	2025年11月	放松训练学习	学习渐进式肌肉放松和呼吸放松技巧，睡前放松练习	success	2026-03-07 15:21:23.33	2026-03-07 15:21:23.33
te-stu-chenjing-202512-sgerb	stu-chenjing	2025年12月	睡眠改善明显	入睡时间从1小时缩短至20分钟，睡眠质量显著提升	success	2026-03-07 15:21:23.333	2026-03-07 15:21:23.333
te-stu-chenjing-20262-ll8e8	stu-chenjing	2026年2月	保持良好习惯	继续保持良好睡眠习惯，日间精神状态良好，学习效率提高	active	2026-03-07 15:21:23.335	2026-03-07 15:21:23.335
te-stu-yangbo-202512-nmmce	stu-yangbo	2025年12月	团队建设活动	参加团队建设活动，团队协作能力提升	success	2026-03-07 15:21:23.338	2026-03-07 15:21:23.338
te-stu-yangbo-20261-49ghf	stu-yangbo	2026年1月	融入良好	班级融入良好，与同学关系融洽，归属感强	success	2026-03-07 15:21:23.34	2026-03-07 15:21:23.34
te-stu-yangbo-20262-3ctvj	stu-yangbo	2026年2月	积极参与	积极参加班级和社团活动，保持积极心态	active	2026-03-07 15:21:23.343	2026-03-07 15:21:23.343
te-stu-xiaoli-20259-gagyy	stu-xiaoli	2025年9月	入学普测优秀	各项指标优秀，心理素质极佳，综合评分81分，各方面均衡	success	2026-03-07 15:21:23.345	2026-03-07 15:21:23.345
te-stu-xiaoli-202510-38673	stu-xiaoli	2025年10月	心理委员任职	被选为班级心理委员，协助开展心理健康工作	success	2026-03-07 15:21:23.347	2026-03-07 15:21:23.347
te-stu-xiaoli-202511-wx1cp	stu-xiaoli	2025年11月	心理活动组织	成功组织多次班级心理健康活动，获得好评	success	2026-03-07 15:21:23.349	2026-03-07 15:21:23.349
te-stu-xiaoli-202512-uzhnd	stu-xiaoli	2025年12月	优秀心理委员	被评为优秀心理委员，工作表现突出	success	2026-03-07 15:21:23.35	2026-03-07 15:21:23.35
te-stu-xiaoli-20262-xeh5v	stu-xiaoli	2026年2月	继续服务同学	新学期继续担任心理委员，服务同学，传播心理健康知识	active	2026-03-07 15:21:23.353	2026-03-07 15:21:23.353
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: psytwin
--

COPY public.users (id, email, name, password_hash, avatar, role, status, last_login_at, created_at, updated_at) FROM stdin;
381b54ea-dc7f-4e42-80bd-e02fd7149dd1	admin@psytwin.com	系统管理员	$2b$10$Z49dBq1LgCICZ0UVvgeyruEgZkVkJNN2lIiiYUp8aB3rU6C6W2zR6	\N	ADMIN	ACTIVE	2026-03-10 09:25:41.053	2026-03-07 05:10:54.262	2026-03-11 20:10:30.063
\.


--
-- Data for Name: vital_signs; Type: TABLE DATA; Schema: public; Owner: psytwin
--

COPY public.vital_signs (id, student_id, "timestamp", heart_rate, hrv, gsr, stress_index, blood_oxygen, created_at, updated_at) FROM stdin;
vs-stu-zhangyu-0	stu-zhangyu	2026-03-07 09:23:47.475	68	24	1.5	22	96	2026-03-06 14:38:40.823	2026-03-07 09:23:47.705
vs-stu-zhangyu-1	stu-zhangyu	2026-03-07 09:22:47.475	72	30	1.8	30	97	2026-03-06 14:38:40.831	2026-03-07 09:23:47.713
vs-stu-zhangyu-2	stu-zhangyu	2026-03-07 09:21:47.475	76	36	2.1	38	98	2026-03-06 14:38:40.836	2026-03-07 09:23:47.717
vs-stu-zhangyu-3	stu-zhangyu	2026-03-07 09:20:47.475	80	42	2.4	46	96	2026-03-06 14:38:40.841	2026-03-07 09:23:47.723
vs-stu-zhangyu-4	stu-zhangyu	2026-03-07 09:19:47.475	84	24	2.7	54	97	2026-03-06 14:38:40.847	2026-03-07 09:23:47.727
vs-stu-liusiyuan-0	stu-liusiyuan	2026-03-07 09:17:47.475	68	24	1.5	22	96	2026-03-06 14:38:40.856	2026-03-07 09:23:47.736
vs-stu-liusiyuan-1	stu-liusiyuan	2026-03-07 09:16:47.475	72	30	1.8	30	97	2026-03-06 14:38:40.861	2026-03-07 09:23:47.741
vs-stu-liusiyuan-2	stu-liusiyuan	2026-03-07 09:15:47.475	76	36	2.1	38	98	2026-03-06 14:38:40.866	2026-03-07 09:23:47.745
vs-stu-liusiyuan-3	stu-liusiyuan	2026-03-07 09:14:47.475	80	42	2.4	46	96	2026-03-06 14:38:40.87	2026-03-07 09:23:47.75
vs-stu-liusiyuan-4	stu-liusiyuan	2026-03-07 09:13:47.475	84	24	2.7	54	97	2026-03-06 14:38:40.874	2026-03-07 09:23:47.754
vs-stu-liusiyuan-5	stu-liusiyuan	2026-03-07 09:12:47.475	68	30	3	62	98	2026-03-06 14:38:40.88	2026-03-07 09:23:47.759
vs-stu-chenyuqing-0	stu-chenyuqing	2026-03-07 09:11:47.475	68	24	1.5	22	96	2026-03-06 14:38:40.885	2026-03-07 09:23:47.763
vs-stu-chenyuqing-1	stu-chenyuqing	2026-03-07 09:10:47.475	72	30	1.8	30	97	2026-03-06 14:38:40.889	2026-03-07 09:23:47.768
vs-stu-chenyuqing-2	stu-chenyuqing	2026-03-07 09:09:47.475	76	36	2.1	38	98	2026-03-06 14:38:40.894	2026-03-07 09:23:47.772
vs-stu-chenyuqing-3	stu-chenyuqing	2026-03-07 09:08:47.475	80	42	2.4	46	96	2026-03-06 14:38:40.899	2026-03-07 09:23:47.776
vs-stu-chenyuqing-4	stu-chenyuqing	2026-03-07 09:07:47.475	84	24	2.7	54	97	2026-03-06 14:38:40.904	2026-03-07 09:23:47.781
vs-stu-chenyuqing-5	stu-chenyuqing	2026-03-07 09:06:47.475	68	30	3	62	98	2026-03-06 14:38:40.909	2026-03-07 09:23:47.785
vs-stu-zhangmingyuan-0	stu-zhangmingyuan	2026-03-07 09:05:47.475	68	24	1.5	22	96	2026-03-06 14:38:40.914	2026-03-07 09:23:47.79
vs-stu-zhangmingyuan-1	stu-zhangmingyuan	2026-03-07 09:04:47.475	72	30	1.8	30	97	2026-03-06 14:38:40.919	2026-03-07 09:23:47.794
vs-stu-zhangmingyuan-2	stu-zhangmingyuan	2026-03-07 09:03:47.475	76	36	2.1	38	98	2026-03-06 14:38:40.924	2026-03-07 09:23:47.799
vs-stu-zhangmingyuan-3	stu-zhangmingyuan	2026-03-07 09:02:47.475	80	42	2.4	46	96	2026-03-06 14:38:40.929	2026-03-07 09:23:47.803
vs-stu-zhangmingyuan-4	stu-zhangmingyuan	2026-03-07 09:01:47.475	84	24	2.7	54	97	2026-03-06 14:38:40.934	2026-03-07 09:23:47.808
vs-stu-zhangmingyuan-5	stu-zhangmingyuan	2026-03-07 09:00:47.475	68	30	3	62	98	2026-03-06 14:38:40.939	2026-03-07 09:23:47.812
vs-stu-wuzhiyuan-0	stu-wuzhiyuan	2026-03-07 08:59:47.475	68	24	1.5	22	96	2026-03-06 14:38:40.945	2026-03-07 09:23:47.817
vs-stu-wuzhiyuan-1	stu-wuzhiyuan	2026-03-07 08:58:47.475	72	30	1.8	30	97	2026-03-06 14:38:40.951	2026-03-07 09:23:47.822
vs-stu-wuzhiyuan-2	stu-wuzhiyuan	2026-03-07 08:57:47.475	76	36	2.1	38	98	2026-03-06 14:38:40.957	2026-03-07 09:23:47.827
vs-stu-wuzhiyuan-3	stu-wuzhiyuan	2026-03-07 08:56:47.475	80	42	2.4	46	96	2026-03-06 14:38:40.962	2026-03-07 09:23:47.831
vs-stu-wuzhiyuan-4	stu-wuzhiyuan	2026-03-07 08:55:47.475	84	24	2.7	54	97	2026-03-06 14:38:40.967	2026-03-07 09:23:47.836
vs-stu-wuzhiyuan-5	stu-wuzhiyuan	2026-03-07 08:54:47.475	68	30	3	62	98	2026-03-06 14:38:40.972	2026-03-07 09:23:47.841
vs-stu-zhouhangyu-1	stu-zhouhangyu	2026-03-07 08:52:47.475	72	30	1.8	30	97	2026-03-06 14:38:40.983	2026-03-07 09:23:47.85
vs-stu-zhouhangyu-2	stu-zhouhangyu	2026-03-07 08:51:47.475	76	36	2.1	38	98	2026-03-06 14:38:40.988	2026-03-07 09:23:47.854
vs-stu-zhouhangyu-3	stu-zhouhangyu	2026-03-07 08:50:47.475	80	42	2.4	46	96	2026-03-06 14:38:40.993	2026-03-07 09:23:47.858
vs-stu-zhouhangyu-4	stu-zhouhangyu	2026-03-07 08:49:47.475	84	24	2.7	54	97	2026-03-06 14:38:40.997	2026-03-07 09:23:47.863
vs-stu-zhaotianyu-0	stu-zhaotianyu	2026-03-07 08:47:47.475	68	24	1.5	22	96	2026-03-06 14:38:41.007	2026-03-07 09:23:47.871
vs-stu-zhaotianyu-1	stu-zhaotianyu	2026-03-07 08:46:47.475	72	30	1.8	30	97	2026-03-06 14:38:41.011	2026-03-07 09:23:47.877
vs-stu-zhaotianyu-2	stu-zhaotianyu	2026-03-07 08:45:47.475	76	36	2.1	38	98	2026-03-06 14:38:41.016	2026-03-07 09:23:47.881
vs-stu-zhaotianyu-3	stu-zhaotianyu	2026-03-07 08:44:47.475	80	42	2.4	46	96	2026-03-06 14:38:41.021	2026-03-07 09:23:47.886
vs-stu-zhaotianyu-4	stu-zhaotianyu	2026-03-07 08:43:47.475	84	24	2.7	54	97	2026-03-06 14:38:41.025	2026-03-07 09:23:47.89
vs-stu-zhaotianyu-5	stu-zhaotianyu	2026-03-07 08:42:47.475	68	30	3	62	98	2026-03-06 14:38:41.03	2026-03-07 09:23:47.894
vs-stu-huangsimeng-0	stu-huangsimeng	2026-03-07 08:41:47.475	68	24	1.5	22	96	2026-03-06 14:38:41.034	2026-03-07 09:23:47.899
vs-stu-huangsimeng-1	stu-huangsimeng	2026-03-07 08:40:47.475	72	30	1.8	30	97	2026-03-06 14:38:41.039	2026-03-07 09:23:47.903
vs-stu-huangsimeng-2	stu-huangsimeng	2026-03-07 08:39:47.475	76	36	2.1	38	98	2026-03-06 14:38:41.043	2026-03-07 09:23:47.907
vs-stu-huangsimeng-3	stu-huangsimeng	2026-03-07 08:38:47.475	80	42	2.4	46	96	2026-03-06 14:38:41.048	2026-03-07 09:23:47.912
vs-stu-huangsimeng-4	stu-huangsimeng	2026-03-07 08:37:47.475	84	24	2.7	54	97	2026-03-06 14:38:41.053	2026-03-07 09:23:47.916
vs-stu-huangsimeng-5	stu-huangsimeng	2026-03-07 08:36:47.475	68	30	3	62	98	2026-03-06 14:38:41.058	2026-03-07 09:23:47.922
vs-stu-linzhihao-0	stu-linzhihao	2026-03-07 08:35:47.475	68	24	1.5	22	96	2026-03-06 14:38:41.063	2026-03-07 09:23:47.926
vs-stu-linzhihao-1	stu-linzhihao	2026-03-07 08:34:47.475	72	30	1.8	30	97	2026-03-06 14:38:41.069	2026-03-07 09:23:47.93
vs-stu-linzhihao-2	stu-linzhihao	2026-03-07 08:33:47.475	76	36	2.1	38	98	2026-03-06 14:38:41.073	2026-03-07 09:23:47.935
vs-stu-linzhihao-3	stu-linzhihao	2026-03-07 08:32:47.475	80	42	2.4	46	96	2026-03-06 14:38:41.078	2026-03-07 09:23:47.94
vs-stu-linzhihao-4	stu-linzhihao	2026-03-07 08:31:47.475	84	24	2.7	54	97	2026-03-06 14:38:41.083	2026-03-07 09:23:47.944
vs-stu-linzhihao-5	stu-linzhihao	2026-03-07 08:30:47.475	68	30	3	62	98	2026-03-06 14:38:41.087	2026-03-07 09:23:47.949
vs-stu-wangyuyan-0	stu-wangyuyan	2026-03-07 08:29:47.475	68	24	1.5	22	96	2026-03-06 14:38:41.092	2026-03-07 09:23:47.953
vs-stu-wangyuyan-1	stu-wangyuyan	2026-03-07 08:28:47.475	72	30	1.8	30	97	2026-03-06 14:38:41.096	2026-03-07 09:23:47.958
vs-stu-wangyuyan-2	stu-wangyuyan	2026-03-07 08:27:47.475	76	36	2.1	38	98	2026-03-06 14:38:41.1	2026-03-07 09:23:47.962
vs-stu-wangyuyan-3	stu-wangyuyan	2026-03-07 08:26:47.475	80	42	2.4	46	96	2026-03-06 14:38:41.105	2026-03-07 09:23:47.967
vs-stu-wangyuyan-4	stu-wangyuyan	2026-03-07 08:25:47.475	84	24	2.7	54	97	2026-03-06 14:38:41.11	2026-03-07 09:23:47.971
vs-stu-wangyuyan-5	stu-wangyuyan	2026-03-07 08:24:47.475	68	30	3	62	98	2026-03-06 14:38:41.114	2026-03-07 09:23:47.975
vs-stu-zhangyu-5	stu-zhangyu	2026-03-07 09:18:47.475	68	30	3	62	98	2026-03-06 14:38:40.852	2026-03-07 09:23:47.732
vs-stu-zhouhangyu-0	stu-zhouhangyu	2026-03-07 08:53:47.475	68	24	1.5	22	96	2026-03-06 14:38:40.977	2026-03-07 09:23:47.845
vs-stu-zhouhangyu-5	stu-zhouhangyu	2026-03-07 08:48:47.475	68	30	3	62	98	2026-03-06 14:38:41.002	2026-03-07 09:23:47.867
\.


--
-- Data for Name: voice_analyses; Type: TABLE DATA; Schema: public; Owner: psytwin
--

COPY public.voice_analyses (id, student_id, "timestamp", sentiment, tremor_index, emotion_label, created_at, updated_at) FROM stdin;
va-stu-zhangyu-0	stu-zhangyu	2026-03-07 09:23:47.475	POSITIVE	0.08	轻松	2026-03-06 14:38:40.826	2026-03-07 09:23:47.708
va-stu-zhangyu-1	stu-zhangyu	2026-03-07 09:22:47.475	NEGATIVE	0.14	焦虑	2026-03-06 14:38:40.832	2026-03-07 09:23:47.714
va-stu-zhangyu-2	stu-zhangyu	2026-03-07 09:21:47.475	NEUTRAL	0.2	专注	2026-03-06 14:38:40.838	2026-03-07 09:23:47.719
va-stu-zhangyu-3	stu-zhangyu	2026-03-07 09:20:47.475	POSITIVE	0.26	轻松	2026-03-06 14:38:40.842	2026-03-07 09:23:47.724
va-stu-zhangyu-4	stu-zhangyu	2026-03-07 09:19:47.475	NEGATIVE	0.32	焦虑	2026-03-06 14:38:40.848	2026-03-07 09:23:47.729
va-stu-zhangyu-5	stu-zhangyu	2026-03-07 09:18:47.475	NEUTRAL	0.38	专注	2026-03-06 14:38:40.853	2026-03-07 09:23:47.733
va-stu-liusiyuan-0	stu-liusiyuan	2026-03-07 09:17:47.475	POSITIVE	0.08	轻松	2026-03-06 14:38:40.858	2026-03-07 09:23:47.738
va-stu-liusiyuan-1	stu-liusiyuan	2026-03-07 09:16:47.475	NEGATIVE	0.14	焦虑	2026-03-06 14:38:40.863	2026-03-07 09:23:47.742
va-stu-liusiyuan-2	stu-liusiyuan	2026-03-07 09:15:47.475	NEUTRAL	0.2	专注	2026-03-06 14:38:40.867	2026-03-07 09:23:47.747
va-stu-liusiyuan-3	stu-liusiyuan	2026-03-07 09:14:47.475	POSITIVE	0.26	轻松	2026-03-06 14:38:40.871	2026-03-07 09:23:47.751
va-stu-liusiyuan-4	stu-liusiyuan	2026-03-07 09:13:47.475	NEGATIVE	0.32	焦虑	2026-03-06 14:38:40.876	2026-03-07 09:23:47.756
va-stu-liusiyuan-5	stu-liusiyuan	2026-03-07 09:12:47.475	NEUTRAL	0.38	专注	2026-03-06 14:38:40.882	2026-03-07 09:23:47.76
va-stu-chenyuqing-0	stu-chenyuqing	2026-03-07 09:11:47.475	POSITIVE	0.08	轻松	2026-03-06 14:38:40.886	2026-03-07 09:23:47.764
va-stu-chenyuqing-1	stu-chenyuqing	2026-03-07 09:10:47.475	NEGATIVE	0.14	焦虑	2026-03-06 14:38:40.891	2026-03-07 09:23:47.769
va-stu-chenyuqing-2	stu-chenyuqing	2026-03-07 09:09:47.475	NEUTRAL	0.2	专注	2026-03-06 14:38:40.896	2026-03-07 09:23:47.773
va-stu-chenyuqing-3	stu-chenyuqing	2026-03-07 09:08:47.475	POSITIVE	0.26	轻松	2026-03-06 14:38:40.901	2026-03-07 09:23:47.778
va-stu-chenyuqing-4	stu-chenyuqing	2026-03-07 09:07:47.475	NEGATIVE	0.32	焦虑	2026-03-06 14:38:40.905	2026-03-07 09:23:47.782
va-stu-chenyuqing-5	stu-chenyuqing	2026-03-07 09:06:47.475	NEUTRAL	0.38	专注	2026-03-06 14:38:40.91	2026-03-07 09:23:47.787
va-stu-zhangmingyuan-0	stu-zhangmingyuan	2026-03-07 09:05:47.475	POSITIVE	0.08	轻松	2026-03-06 14:38:40.915	2026-03-07 09:23:47.791
va-stu-zhangmingyuan-1	stu-zhangmingyuan	2026-03-07 09:04:47.475	NEGATIVE	0.14	焦虑	2026-03-06 14:38:40.92	2026-03-07 09:23:47.796
va-stu-zhangmingyuan-2	stu-zhangmingyuan	2026-03-07 09:03:47.475	NEUTRAL	0.2	专注	2026-03-06 14:38:40.925	2026-03-07 09:23:47.8
va-stu-zhangmingyuan-3	stu-zhangmingyuan	2026-03-07 09:02:47.475	POSITIVE	0.26	轻松	2026-03-06 14:38:40.931	2026-03-07 09:23:47.805
va-stu-zhangmingyuan-4	stu-zhangmingyuan	2026-03-07 09:01:47.475	NEGATIVE	0.32	焦虑	2026-03-06 14:38:40.936	2026-03-07 09:23:47.809
va-stu-zhangmingyuan-5	stu-zhangmingyuan	2026-03-07 09:00:47.475	NEUTRAL	0.38	专注	2026-03-06 14:38:40.942	2026-03-07 09:23:47.813
va-stu-wuzhiyuan-0	stu-wuzhiyuan	2026-03-07 08:59:47.475	POSITIVE	0.08	轻松	2026-03-06 14:38:40.948	2026-03-07 09:23:47.819
va-stu-wuzhiyuan-1	stu-wuzhiyuan	2026-03-07 08:58:47.475	NEGATIVE	0.14	焦虑	2026-03-06 14:38:40.953	2026-03-07 09:23:47.823
va-stu-wuzhiyuan-2	stu-wuzhiyuan	2026-03-07 08:57:47.475	NEUTRAL	0.2	专注	2026-03-06 14:38:40.959	2026-03-07 09:23:47.828
va-stu-wuzhiyuan-3	stu-wuzhiyuan	2026-03-07 08:56:47.475	POSITIVE	0.26	轻松	2026-03-06 14:38:40.963	2026-03-07 09:23:47.832
va-stu-wuzhiyuan-4	stu-wuzhiyuan	2026-03-07 08:55:47.475	NEGATIVE	0.32	焦虑	2026-03-06 14:38:40.969	2026-03-07 09:23:47.838
va-stu-wuzhiyuan-5	stu-wuzhiyuan	2026-03-07 08:54:47.475	NEUTRAL	0.38	专注	2026-03-06 14:38:40.974	2026-03-07 09:23:47.842
va-stu-zhouhangyu-0	stu-zhouhangyu	2026-03-07 08:53:47.475	POSITIVE	0.08	轻松	2026-03-06 14:38:40.979	2026-03-07 09:23:47.847
va-stu-zhouhangyu-1	stu-zhouhangyu	2026-03-07 08:52:47.475	NEGATIVE	0.14	焦虑	2026-03-06 14:38:40.985	2026-03-07 09:23:47.851
va-stu-zhouhangyu-2	stu-zhouhangyu	2026-03-07 08:51:47.475	NEUTRAL	0.2	专注	2026-03-06 14:38:40.99	2026-03-07 09:23:47.856
va-stu-zhouhangyu-3	stu-zhouhangyu	2026-03-07 08:50:47.475	POSITIVE	0.26	轻松	2026-03-06 14:38:40.994	2026-03-07 09:23:47.86
va-stu-zhouhangyu-4	stu-zhouhangyu	2026-03-07 08:49:47.475	NEGATIVE	0.32	焦虑	2026-03-06 14:38:40.999	2026-03-07 09:23:47.864
va-stu-zhouhangyu-5	stu-zhouhangyu	2026-03-07 08:48:47.475	NEUTRAL	0.38	专注	2026-03-06 14:38:41.004	2026-03-07 09:23:47.868
va-stu-zhaotianyu-0	stu-zhaotianyu	2026-03-07 08:47:47.475	POSITIVE	0.08	轻松	2026-03-06 14:38:41.009	2026-03-07 09:23:47.873
va-stu-zhaotianyu-1	stu-zhaotianyu	2026-03-07 08:46:47.475	NEGATIVE	0.14	焦虑	2026-03-06 14:38:41.013	2026-03-07 09:23:47.879
va-stu-zhaotianyu-2	stu-zhaotianyu	2026-03-07 08:45:47.475	NEUTRAL	0.2	专注	2026-03-06 14:38:41.018	2026-03-07 09:23:47.883
va-stu-zhaotianyu-3	stu-zhaotianyu	2026-03-07 08:44:47.475	POSITIVE	0.26	轻松	2026-03-06 14:38:41.022	2026-03-07 09:23:47.887
va-stu-zhaotianyu-4	stu-zhaotianyu	2026-03-07 08:43:47.475	NEGATIVE	0.32	焦虑	2026-03-06 14:38:41.027	2026-03-07 09:23:47.892
va-stu-zhaotianyu-5	stu-zhaotianyu	2026-03-07 08:42:47.475	NEUTRAL	0.38	专注	2026-03-06 14:38:41.031	2026-03-07 09:23:47.896
va-stu-huangsimeng-0	stu-huangsimeng	2026-03-07 08:41:47.475	POSITIVE	0.08	轻松	2026-03-06 14:38:41.036	2026-03-07 09:23:47.9
va-stu-huangsimeng-1	stu-huangsimeng	2026-03-07 08:40:47.475	NEGATIVE	0.14	焦虑	2026-03-06 14:38:41.04	2026-03-07 09:23:47.904
va-stu-huangsimeng-2	stu-huangsimeng	2026-03-07 08:39:47.475	NEUTRAL	0.2	专注	2026-03-06 14:38:41.045	2026-03-07 09:23:47.909
va-stu-huangsimeng-3	stu-huangsimeng	2026-03-07 08:38:47.475	POSITIVE	0.26	轻松	2026-03-06 14:38:41.05	2026-03-07 09:23:47.913
va-stu-huangsimeng-4	stu-huangsimeng	2026-03-07 08:37:47.475	NEGATIVE	0.32	焦虑	2026-03-06 14:38:41.054	2026-03-07 09:23:47.918
va-stu-huangsimeng-5	stu-huangsimeng	2026-03-07 08:36:47.475	NEUTRAL	0.38	专注	2026-03-06 14:38:41.06	2026-03-07 09:23:47.923
va-stu-linzhihao-0	stu-linzhihao	2026-03-07 08:35:47.475	POSITIVE	0.08	轻松	2026-03-06 14:38:41.066	2026-03-07 09:23:47.928
va-stu-linzhihao-1	stu-linzhihao	2026-03-07 08:34:47.475	NEGATIVE	0.14	焦虑	2026-03-06 14:38:41.07	2026-03-07 09:23:47.932
va-stu-linzhihao-2	stu-linzhihao	2026-03-07 08:33:47.475	NEUTRAL	0.2	专注	2026-03-06 14:38:41.075	2026-03-07 09:23:47.937
va-stu-linzhihao-3	stu-linzhihao	2026-03-07 08:32:47.475	POSITIVE	0.26	轻松	2026-03-06 14:38:41.079	2026-03-07 09:23:47.941
va-stu-linzhihao-4	stu-linzhihao	2026-03-07 08:31:47.475	NEGATIVE	0.32	焦虑	2026-03-06 14:38:41.084	2026-03-07 09:23:47.945
va-stu-linzhihao-5	stu-linzhihao	2026-03-07 08:30:47.475	NEUTRAL	0.38	专注	2026-03-06 14:38:41.088	2026-03-07 09:23:47.95
va-stu-wangyuyan-0	stu-wangyuyan	2026-03-07 08:29:47.475	POSITIVE	0.08	轻松	2026-03-06 14:38:41.093	2026-03-07 09:23:47.955
va-stu-wangyuyan-1	stu-wangyuyan	2026-03-07 08:28:47.475	NEGATIVE	0.14	焦虑	2026-03-06 14:38:41.098	2026-03-07 09:23:47.959
va-stu-wangyuyan-2	stu-wangyuyan	2026-03-07 08:27:47.475	NEUTRAL	0.2	专注	2026-03-06 14:38:41.102	2026-03-07 09:23:47.964
va-stu-wangyuyan-3	stu-wangyuyan	2026-03-07 08:26:47.475	POSITIVE	0.26	轻松	2026-03-06 14:38:41.107	2026-03-07 09:23:47.968
va-stu-wangyuyan-4	stu-wangyuyan	2026-03-07 08:25:47.475	NEGATIVE	0.32	焦虑	2026-03-06 14:38:41.111	2026-03-07 09:23:47.972
va-stu-wangyuyan-5	stu-wangyuyan	2026-03-07 08:24:47.475	NEUTRAL	0.38	专注	2026-03-06 14:38:41.115	2026-03-07 09:23:47.977
\.


--
-- Data for Name: vr_scenes; Type: TABLE DATA; Schema: public; Owner: psytwin
--

COPY public.vr_scenes (id, name, description, usage_count, created_at, updated_at) FROM stdin;
scene-social	社交焦虑脱敏	降低社交焦虑	2340	2026-03-06 14:38:40.733	2026-03-07 09:23:47.629
scene-exam	考试压力释放	缓解考前压力	1980	2026-03-06 14:38:40.735	2026-03-07 09:23:47.631
scene-mindfulness	正念冥想空间	冥想放松	2680	2026-03-06 14:38:40.737	2026-03-07 09:23:47.633
scene-release	情绪宣泄训练	情绪管理训练	1432	2026-03-06 14:38:40.738	2026-03-07 09:23:47.634
\.


--
-- Data for Name: vr_sessions; Type: TABLE DATA; Schema: public; Owner: psytwin
--

COPY public.vr_sessions (id, student_id, scene_id, duration, emotion_before, emotion_after, result, session_at, created_at, updated_at) FROM stdin;
vrs-01	stu-liusiyuan	scene-social	28分钟	焦虑	平静	POSITIVE	2026-03-06 14:38:36.206	2026-03-06 14:38:40.74	2026-03-07 09:23:47.635
vrs-02	stu-chenyuqing	scene-exam	22分钟	紧张	放松	POSITIVE	2026-03-06 14:38:36.206	2026-03-06 14:38:40.742	2026-03-07 09:23:47.638
vrs-03	stu-zhangmingyuan	scene-mindfulness	30分钟	烦躁	安宁	POSITIVE	2026-03-06 14:38:36.206	2026-03-06 14:38:40.746	2026-03-07 09:23:47.639
vrs-04	stu-wuzhiyuan	scene-release	18分钟	压抑	舒畅	POSITIVE	2026-03-06 14:38:36.206	2026-03-06 14:38:40.747	2026-03-07 09:23:47.641
vrs-05	stu-zhouhangyu	scene-social	25分钟	回避	中性	NEUTRAL	2026-03-06 14:38:36.206	2026-03-06 14:38:40.749	2026-03-07 09:23:47.642
vrs-06	stu-zhaotianyu	scene-exam	20分钟	焦虑	放松	POSITIVE	2026-03-06 14:38:36.206	2026-03-06 14:38:40.751	2026-03-07 09:23:47.644
vrs-07	stu-huangsimeng	scene-mindfulness	35分钟	低落	平和	POSITIVE	2026-03-06 14:38:36.206	2026-03-06 14:38:40.753	2026-03-07 09:23:47.646
vrs-08	stu-linzhihao	scene-release	15分钟	愤怒	中性	NEUTRAL	2026-03-06 14:38:36.206	2026-03-06 14:38:40.755	2026-03-07 09:23:47.647
vrs-09	stu-wangyuyan	scene-social	26分钟	恐惧	平静	POSITIVE	2026-03-06 14:38:36.206	2026-03-06 14:38:40.757	2026-03-07 09:23:47.649
vrs-10	stu-zhangyu	scene-exam	19分钟	紧张	轻松	POSITIVE	2026-03-06 14:38:36.206	2026-03-06 14:38:40.759	2026-03-07 09:23:47.65
\.


--
-- Data for Name: warnings; Type: TABLE DATA; Schema: public; Owner: psytwin
--

COPY public.warnings (id, student_id, "riskLevel", risk_reason, trigger_source, trigger_content, status, assigned_to, last_action, notes, created_at, updated_at) FROM stdin;
w3	stu-chenjing	MEDIUM	周活跃度下降60%，发布负面动态	post	最近什么都不想做，感觉生活没有意义	PENDING	\N	null		2026-03-08 15:10:54.537	2026-03-10 10:00:38.717
w1	stu-linzhihao	HIGH	聊天中出现自伤倾向关键词	chat	我觉得活着好累，不知道还有什么意义	PENDING	\N	null		2026-03-08 15:10:54.524	2026-03-10 10:02:34.062
w2	stu-yangbo	HIGH	连续3天情绪评分低于-0.8	assessment	\N	PROCESSING	\N	"{\\"type\\":\\"message\\",\\"content\\":\\"已发送关怀消息\\",\\"time\\":\\"2026-03-06T14:30:00Z\\"}"	已联系学生，情况暂时稳定	2026-03-08 15:10:54.53	2026-03-10 10:03:01.833
w4	stu-zhouhangyu	MEDIUM	连续一周情绪标签为"焦虑"	chat	\N	RESOLVED	\N	"{\\"type\\":\\"appointment\\",\\"content\\":\\"已预约3月7日咨询\\",\\"time\\":\\"2026-03-05T19:00:00Z\\"}"	学生已接受咨询预约	2026-03-08 15:10:54.54	2026-03-10 10:03:43.01
w5	stu-wuzhiyuan	LOW	情绪波动较大	behavior	\N	PENDING	\N	null		2026-03-08 15:10:54.544	2026-03-10 10:03:52.711
w6	stu-liweimin	LOW	睡眠质量下降	assessment	\N	PENDING	\N	null		2026-03-08 15:10:54.547	2026-03-10 10:03:58.834
\.


--
-- Data for Name: work_orders; Type: TABLE DATA; Schema: public; Owner: psytwin
--

COPY public.work_orders (id, student_id, class_name, trigger, risk_level, method, counselor, status, date, detail, summary, created_at, updated_at) FROM stdin;
wo-09	stu-wangyuyan	网络2401	社交回避行为加剧	MEDIUM	VR脱敏训练	刘芳	PENDING	2026-02-06 00:00:00	第二次训练进行中	社交回避	2026-03-06 14:38:40.714	2026-03-07 09:23:47.611
wo-10	stu-zhangyu	大数据2502	情绪波动指数持续高位	MEDIUM	线下谈话	王丽	PENDING	2026-02-05 00:00:00	CBT 第一阶段	情绪波动	2026-03-06 14:38:40.716	2026-03-07 09:23:47.612
wo-11	stu-chenyuqing	软件2402	VR体验后情绪反弹	HIGH	线下谈话	张伟	IN_PROGRESS	2026-02-20 00:00:00	需要持续跟踪	情绪异常	2026-03-06 14:38:40.717	2026-03-07 09:23:47.614
wo-12	stu-zhangmingyuan	网络2401	宿舍人际关系冲突	MEDIUM	团体辅导	刘芳	IN_PROGRESS	2026-02-19 00:00:00	已安排宿舍调解	人际冲突	2026-03-06 14:38:40.719	2026-03-07 09:23:47.616
wo-13	stu-liusiyuan	数媒2401	期末考压力导致失眠	MEDIUM	正念训练	王丽	COMPLETED	2026-02-16 00:00:00	已恢复睡眠	考试焦虑	2026-03-06 14:38:40.72	2026-03-07 09:23:47.617
wo-14	stu-wuzhiyuan	大数据2502	网络游戏成瘾评估	LOW	认知行为疗法	张伟	COMPLETED	2026-02-11 00:00:00	已建立健康作息	网络依赖	2026-03-06 14:38:40.722	2026-03-07 09:23:47.619
wo-01	stu-chenyuqing	软件2402	语音情感异常连续触发	HIGH	VR脱敏训练	刘芳	PENDING	2026-02-18 00:00:00	第3次VR训练后焦虑指数下降18%	连续3次语音检测触发阈值	2026-03-06 14:38:40.699	2026-03-07 09:23:47.594
wo-02	stu-zhangmingyuan	网络2401	心率持续偏高（>110bpm）	HIGH	线下谈话	张伟	PENDING	2026-02-17 00:00:00	已安排心理咨询师面谈2次	心率连续45分钟超过110bpm	2026-03-06 14:38:40.702	2026-03-07 09:23:47.597
wo-03	stu-liusiyuan	数媒2401	连续7天睡眠不足4小时	MEDIUM	VR脱敏训练	王丽	PENDING	2026-02-15 00:00:00	复查正常	近7日睡眠不足	2026-03-06 14:38:40.704	2026-03-07 09:23:47.599
wo-04	stu-wuzhiyuan	大数据2502	14天未出宿舍门禁	HIGH	线下谈话	刘芳	PENDING	2026-02-14 00:00:00	安排团体辅导	社交隔离	2026-03-06 14:38:40.706	2026-03-07 09:23:47.602
wo-05	stu-zhouhangyu	虚拟2503	语音颤抖频率超标	MEDIUM	VR脱敏训练	张伟	PENDING	2026-02-13 00:00:00	声学指标恢复正常	语音颤抖频发	2026-03-06 14:38:40.707	2026-03-07 09:23:47.603
wo-06	stu-zhaotianyu	信安2401	突发心率飙升（145bpm）	HIGH	线下谈话	刘芳	PENDING	2026-02-12 00:00:00	等待排班安排	心率激增	2026-03-06 14:38:40.709	2026-03-07 09:23:47.606
wo-07	stu-huangsimeng	软件2402	食堂消费记录连续7天为零	MEDIUM	线下谈话	王丽	PENDING	2026-02-10 00:00:00	确认为饮食习惯调整	进食异常	2026-03-06 14:38:40.711	2026-03-07 09:23:47.608
wo-08	stu-linzhihao	大数据2502	行动轨迹异常收缩	LOW	VR脱敏训练	张伟	PENDING	2026-02-08 00:00:00	解除关注	步态异常	2026-03-06 14:38:40.712	2026-03-07 09:23:47.609
\.


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: psytwin
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: ai_documents ai_documents_pkey; Type: CONSTRAINT; Schema: public; Owner: psytwin
--

ALTER TABLE ONLY public.ai_documents
    ADD CONSTRAINT ai_documents_pkey PRIMARY KEY (id);


--
-- Name: ai_prompt_presets ai_prompt_presets_pkey; Type: CONSTRAINT; Schema: public; Owner: psytwin
--

ALTER TABLE ONLY public.ai_prompt_presets
    ADD CONSTRAINT ai_prompt_presets_pkey PRIMARY KEY (id);


--
-- Name: alerts alerts_pkey; Type: CONSTRAINT; Schema: public; Owner: psytwin
--

ALTER TABLE ONLY public.alerts
    ADD CONSTRAINT alerts_pkey PRIMARY KEY (id);


--
-- Name: appointments appointments_pkey; Type: CONSTRAINT; Schema: public; Owner: psytwin
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_pkey PRIMARY KEY (id);


--
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: psytwin
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


--
-- Name: chat_messages chat_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: psytwin
--

ALTER TABLE ONLY public.chat_messages
    ADD CONSTRAINT chat_messages_pkey PRIMARY KEY (id);


--
-- Name: chat_sessions chat_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: psytwin
--

ALTER TABLE ONLY public.chat_sessions
    ADD CONSTRAINT chat_sessions_pkey PRIMARY KEY (id);


--
-- Name: comments comments_pkey; Type: CONSTRAINT; Schema: public; Owner: psytwin
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_pkey PRIMARY KEY (id);


--
-- Name: consultation_rooms consultation_rooms_pkey; Type: CONSTRAINT; Schema: public; Owner: psytwin
--

ALTER TABLE ONLY public.consultation_rooms
    ADD CONSTRAINT consultation_rooms_pkey PRIMARY KEY (id);


--
-- Name: data_sources data_sources_pkey; Type: CONSTRAINT; Schema: public; Owner: psytwin
--

ALTER TABLE ONLY public.data_sources
    ADD CONSTRAINT data_sources_pkey PRIMARY KEY (id);


--
-- Name: devices devices_pkey; Type: CONSTRAINT; Schema: public; Owner: psytwin
--

ALTER TABLE ONLY public.devices
    ADD CONSTRAINT devices_pkey PRIMARY KEY (id);


--
-- Name: document_chunks document_chunks_pkey; Type: CONSTRAINT; Schema: public; Owner: psytwin
--

ALTER TABLE ONLY public.document_chunks
    ADD CONSTRAINT document_chunks_pkey PRIMARY KEY (id);


--
-- Name: expression_data expression_data_pkey; Type: CONSTRAINT; Schema: public; Owner: psytwin
--

ALTER TABLE ONLY public.expression_data
    ADD CONSTRAINT expression_data_pkey PRIMARY KEY (id);


--
-- Name: faculties faculties_pkey; Type: CONSTRAINT; Schema: public; Owner: psytwin
--

ALTER TABLE ONLY public.faculties
    ADD CONSTRAINT faculties_pkey PRIMARY KEY (id);


--
-- Name: intervention_details intervention_details_pkey; Type: CONSTRAINT; Schema: public; Owner: psytwin
--

ALTER TABLE ONLY public.intervention_details
    ADD CONSTRAINT intervention_details_pkey PRIMARY KEY (id);


--
-- Name: intervention_records intervention_records_pkey; Type: CONSTRAINT; Schema: public; Owner: psytwin
--

ALTER TABLE ONLY public.intervention_records
    ADD CONSTRAINT intervention_records_pkey PRIMARY KEY (id);


--
-- Name: ip_whitelist ip_whitelist_pkey; Type: CONSTRAINT; Schema: public; Owner: psytwin
--

ALTER TABLE ONLY public.ip_whitelist
    ADD CONSTRAINT ip_whitelist_pkey PRIMARY KEY (id);


--
-- Name: notification_channels notification_channels_pkey; Type: CONSTRAINT; Schema: public; Owner: psytwin
--

ALTER TABLE ONLY public.notification_channels
    ADD CONSTRAINT notification_channels_pkey PRIMARY KEY (id);


--
-- Name: notification_histories notification_histories_pkey; Type: CONSTRAINT; Schema: public; Owner: psytwin
--

ALTER TABLE ONLY public.notification_histories
    ADD CONSTRAINT notification_histories_pkey PRIMARY KEY (id);


--
-- Name: notification_rules notification_rules_pkey; Type: CONSTRAINT; Schema: public; Owner: psytwin
--

ALTER TABLE ONLY public.notification_rules
    ADD CONSTRAINT notification_rules_pkey PRIMARY KEY (id);


--
-- Name: notification_templates notification_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: psytwin
--

ALTER TABLE ONLY public.notification_templates
    ADD CONSTRAINT notification_templates_pkey PRIMARY KEY (id);


--
-- Name: post_collections post_collections_pkey; Type: CONSTRAINT; Schema: public; Owner: psytwin
--

ALTER TABLE ONLY public.post_collections
    ADD CONSTRAINT post_collections_pkey PRIMARY KEY (id);


--
-- Name: post_likes post_likes_pkey; Type: CONSTRAINT; Schema: public; Owner: psytwin
--

ALTER TABLE ONLY public.post_likes
    ADD CONSTRAINT post_likes_pkey PRIMARY KEY (id);


--
-- Name: posts posts_pkey; Type: CONSTRAINT; Schema: public; Owner: psytwin
--

ALTER TABLE ONLY public.posts
    ADD CONSTRAINT posts_pkey PRIMARY KEY (id);


--
-- Name: psych_profiles psych_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: psytwin
--

ALTER TABLE ONLY public.psych_profiles
    ADD CONSTRAINT psych_profiles_pkey PRIMARY KEY (id);


--
-- Name: room_devices room_devices_pkey; Type: CONSTRAINT; Schema: public; Owner: psytwin
--

ALTER TABLE ONLY public.room_devices
    ADD CONSTRAINT room_devices_pkey PRIMARY KEY (id);


--
-- Name: schedules schedules_pkey; Type: CONSTRAINT; Schema: public; Owner: psytwin
--

ALTER TABLE ONLY public.schedules
    ADD CONSTRAINT schedules_pkey PRIMARY KEY (id);


--
-- Name: silent_hours silent_hours_pkey; Type: CONSTRAINT; Schema: public; Owner: psytwin
--

ALTER TABLE ONLY public.silent_hours
    ADD CONSTRAINT silent_hours_pkey PRIMARY KEY (id);


--
-- Name: student_notifications student_notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: psytwin
--

ALTER TABLE ONLY public.student_notifications
    ADD CONSTRAINT student_notifications_pkey PRIMARY KEY (id);


--
-- Name: students students_pkey; Type: CONSTRAINT; Schema: public; Owner: psytwin
--

ALTER TABLE ONLY public.students
    ADD CONSTRAINT students_pkey PRIMARY KEY (id);


--
-- Name: sync_logs sync_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: psytwin
--

ALTER TABLE ONLY public.sync_logs
    ADD CONSTRAINT sync_logs_pkey PRIMARY KEY (id);


--
-- Name: sync_tasks sync_tasks_pkey; Type: CONSTRAINT; Schema: public; Owner: psytwin
--

ALTER TABLE ONLY public.sync_tasks
    ADD CONSTRAINT sync_tasks_pkey PRIMARY KEY (id);


--
-- Name: system_config system_config_pkey; Type: CONSTRAINT; Schema: public; Owner: psytwin
--

ALTER TABLE ONLY public.system_config
    ADD CONSTRAINT system_config_pkey PRIMARY KEY (id);


--
-- Name: teachers teachers_pkey; Type: CONSTRAINT; Schema: public; Owner: psytwin
--

ALTER TABLE ONLY public.teachers
    ADD CONSTRAINT teachers_pkey PRIMARY KEY (id);


--
-- Name: timeline_events timeline_events_pkey; Type: CONSTRAINT; Schema: public; Owner: psytwin
--

ALTER TABLE ONLY public.timeline_events
    ADD CONSTRAINT timeline_events_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: psytwin
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: vital_signs vital_signs_pkey; Type: CONSTRAINT; Schema: public; Owner: psytwin
--

ALTER TABLE ONLY public.vital_signs
    ADD CONSTRAINT vital_signs_pkey PRIMARY KEY (id);


--
-- Name: voice_analyses voice_analyses_pkey; Type: CONSTRAINT; Schema: public; Owner: psytwin
--

ALTER TABLE ONLY public.voice_analyses
    ADD CONSTRAINT voice_analyses_pkey PRIMARY KEY (id);


--
-- Name: vr_scenes vr_scenes_pkey; Type: CONSTRAINT; Schema: public; Owner: psytwin
--

ALTER TABLE ONLY public.vr_scenes
    ADD CONSTRAINT vr_scenes_pkey PRIMARY KEY (id);


--
-- Name: vr_sessions vr_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: psytwin
--

ALTER TABLE ONLY public.vr_sessions
    ADD CONSTRAINT vr_sessions_pkey PRIMARY KEY (id);


--
-- Name: warnings warnings_pkey; Type: CONSTRAINT; Schema: public; Owner: psytwin
--

ALTER TABLE ONLY public.warnings
    ADD CONSTRAINT warnings_pkey PRIMARY KEY (id);


--
-- Name: work_orders work_orders_pkey; Type: CONSTRAINT; Schema: public; Owner: psytwin
--

ALTER TABLE ONLY public.work_orders
    ADD CONSTRAINT work_orders_pkey PRIMARY KEY (id);


--
-- Name: ai_documents_name_key; Type: INDEX; Schema: public; Owner: psytwin
--

CREATE UNIQUE INDEX ai_documents_name_key ON public.ai_documents USING btree (name);


--
-- Name: ai_documents_status_idx; Type: INDEX; Schema: public; Owner: psytwin
--

CREATE INDEX ai_documents_status_idx ON public.ai_documents USING btree (status);


--
-- Name: ai_documents_upload_date_idx; Type: INDEX; Schema: public; Owner: psytwin
--

CREATE INDEX ai_documents_upload_date_idx ON public.ai_documents USING btree (upload_date);


--
-- Name: ai_prompt_presets_is_active_idx; Type: INDEX; Schema: public; Owner: psytwin
--

CREATE INDEX ai_prompt_presets_is_active_idx ON public.ai_prompt_presets USING btree (is_active);


--
-- Name: ai_prompt_presets_value_key; Type: INDEX; Schema: public; Owner: psytwin
--

CREATE UNIQUE INDEX ai_prompt_presets_value_key ON public.ai_prompt_presets USING btree (value);


--
-- Name: alerts_alert_time_idx; Type: INDEX; Schema: public; Owner: psytwin
--

CREATE INDEX alerts_alert_time_idx ON public.alerts USING btree (alert_time);


--
-- Name: alerts_level_idx; Type: INDEX; Schema: public; Owner: psytwin
--

CREATE INDEX alerts_level_idx ON public.alerts USING btree (level);


--
-- Name: alerts_student_id_idx; Type: INDEX; Schema: public; Owner: psytwin
--

CREATE INDEX alerts_student_id_idx ON public.alerts USING btree (student_id);


--
-- Name: alerts_type_idx; Type: INDEX; Schema: public; Owner: psytwin
--

CREATE INDEX alerts_type_idx ON public.alerts USING btree (type);


--
-- Name: appointments_date_idx; Type: INDEX; Schema: public; Owner: psytwin
--

CREATE INDEX appointments_date_idx ON public.appointments USING btree (date);


--
-- Name: appointments_status_idx; Type: INDEX; Schema: public; Owner: psytwin
--

CREATE INDEX appointments_status_idx ON public.appointments USING btree (status);


--
-- Name: appointments_student_id_idx; Type: INDEX; Schema: public; Owner: psytwin
--

CREATE INDEX appointments_student_id_idx ON public.appointments USING btree (student_id);


--
-- Name: appointments_teacher_id_idx; Type: INDEX; Schema: public; Owner: psytwin
--

CREATE INDEX appointments_teacher_id_idx ON public.appointments USING btree (teacher_id);


--
-- Name: audit_logs_action_idx; Type: INDEX; Schema: public; Owner: psytwin
--

CREATE INDEX audit_logs_action_idx ON public.audit_logs USING btree (action);


--
-- Name: audit_logs_created_at_idx; Type: INDEX; Schema: public; Owner: psytwin
--

CREATE INDEX audit_logs_created_at_idx ON public.audit_logs USING btree (created_at);


--
-- Name: audit_logs_user_id_idx; Type: INDEX; Schema: public; Owner: psytwin
--

CREATE INDEX audit_logs_user_id_idx ON public.audit_logs USING btree (user_id);


--
-- Name: chat_messages_created_at_idx; Type: INDEX; Schema: public; Owner: psytwin
--

CREATE INDEX chat_messages_created_at_idx ON public.chat_messages USING btree (created_at);


--
-- Name: chat_messages_seq_idx; Type: INDEX; Schema: public; Owner: psytwin
--

CREATE INDEX chat_messages_seq_idx ON public.chat_messages USING btree (seq);


--
-- Name: chat_messages_session_id_idx; Type: INDEX; Schema: public; Owner: psytwin
--

CREATE INDEX chat_messages_session_id_idx ON public.chat_messages USING btree (session_id);


--
-- Name: chat_messages_status_idx; Type: INDEX; Schema: public; Owner: psytwin
--

CREATE INDEX chat_messages_status_idx ON public.chat_messages USING btree (status);


--
-- Name: chat_sessions_last_message_at_idx; Type: INDEX; Schema: public; Owner: psytwin
--

CREATE INDEX chat_sessions_last_message_at_idx ON public.chat_sessions USING btree (last_message_at);


--
-- Name: chat_sessions_status_idx; Type: INDEX; Schema: public; Owner: psytwin
--

CREATE INDEX chat_sessions_status_idx ON public.chat_sessions USING btree (status);


--
-- Name: chat_sessions_student_id_idx; Type: INDEX; Schema: public; Owner: psytwin
--

CREATE INDEX chat_sessions_student_id_idx ON public.chat_sessions USING btree (student_id);


--
-- Name: comments_author_id_idx; Type: INDEX; Schema: public; Owner: psytwin
--

CREATE INDEX comments_author_id_idx ON public.comments USING btree (author_id);


--
-- Name: comments_parent_id_idx; Type: INDEX; Schema: public; Owner: psytwin
--

CREATE INDEX comments_parent_id_idx ON public.comments USING btree (parent_id);


--
-- Name: comments_post_id_idx; Type: INDEX; Schema: public; Owner: psytwin
--

CREATE INDEX comments_post_id_idx ON public.comments USING btree (post_id);


--
-- Name: consultation_rooms_current_student_id_idx; Type: INDEX; Schema: public; Owner: psytwin
--

CREATE INDEX consultation_rooms_current_student_id_idx ON public.consultation_rooms USING btree (current_student_id);


--
-- Name: consultation_rooms_status_idx; Type: INDEX; Schema: public; Owner: psytwin
--

CREATE INDEX consultation_rooms_status_idx ON public.consultation_rooms USING btree (status);


--
-- Name: devices_serial_number_key; Type: INDEX; Schema: public; Owner: psytwin
--

CREATE UNIQUE INDEX devices_serial_number_key ON public.devices USING btree (serial_number);


--
-- Name: devices_status_idx; Type: INDEX; Schema: public; Owner: psytwin
--

CREATE INDEX devices_status_idx ON public.devices USING btree (status);


--
-- Name: devices_type_idx; Type: INDEX; Schema: public; Owner: psytwin
--

CREATE INDEX devices_type_idx ON public.devices USING btree (type);


--
-- Name: document_chunks_chunk_index_idx; Type: INDEX; Schema: public; Owner: psytwin
--

CREATE INDEX document_chunks_chunk_index_idx ON public.document_chunks USING btree (chunk_index);


--
-- Name: document_chunks_document_id_idx; Type: INDEX; Schema: public; Owner: psytwin
--

CREATE INDEX document_chunks_document_id_idx ON public.document_chunks USING btree (document_id);


--
-- Name: expression_data_student_id_idx; Type: INDEX; Schema: public; Owner: psytwin
--

CREATE INDEX expression_data_student_id_idx ON public.expression_data USING btree (student_id);


--
-- Name: expression_data_student_id_timestamp_idx; Type: INDEX; Schema: public; Owner: psytwin
--

CREATE INDEX expression_data_student_id_timestamp_idx ON public.expression_data USING btree (student_id, "timestamp");


--
-- Name: expression_data_timestamp_idx; Type: INDEX; Schema: public; Owner: psytwin
--

CREATE INDEX expression_data_timestamp_idx ON public.expression_data USING btree ("timestamp");


--
-- Name: faculties_name_key; Type: INDEX; Schema: public; Owner: psytwin
--

CREATE UNIQUE INDEX faculties_name_key ON public.faculties USING btree (name);


--
-- Name: faculties_risk_level_idx; Type: INDEX; Schema: public; Owner: psytwin
--

CREATE INDEX faculties_risk_level_idx ON public.faculties USING btree (risk_level);


--
-- Name: intervention_details_record_id_idx; Type: INDEX; Schema: public; Owner: psytwin
--

CREATE INDEX intervention_details_record_id_idx ON public.intervention_details USING btree (record_id);


--
-- Name: intervention_details_record_id_key; Type: INDEX; Schema: public; Owner: psytwin
--

CREATE UNIQUE INDEX intervention_details_record_id_key ON public.intervention_details USING btree (record_id);


--
-- Name: intervention_records_date_idx; Type: INDEX; Schema: public; Owner: psytwin
--

CREATE INDEX intervention_records_date_idx ON public.intervention_records USING btree (date);


--
-- Name: intervention_records_status_idx; Type: INDEX; Schema: public; Owner: psytwin
--

CREATE INDEX intervention_records_status_idx ON public.intervention_records USING btree (status);


--
-- Name: intervention_records_student_id_idx; Type: INDEX; Schema: public; Owner: psytwin
--

CREATE INDEX intervention_records_student_id_idx ON public.intervention_records USING btree (student_id);


--
-- Name: intervention_records_type_idx; Type: INDEX; Schema: public; Owner: psytwin
--

CREATE INDEX intervention_records_type_idx ON public.intervention_records USING btree (type);


--
-- Name: ip_whitelist_ip_address_idx; Type: INDEX; Schema: public; Owner: psytwin
--

CREATE INDEX ip_whitelist_ip_address_idx ON public.ip_whitelist USING btree (ip_address);


--
-- Name: notification_histories_recipient_idx; Type: INDEX; Schema: public; Owner: psytwin
--

CREATE INDEX notification_histories_recipient_idx ON public.notification_histories USING btree (recipient);


--
-- Name: notification_histories_sent_at_idx; Type: INDEX; Schema: public; Owner: psytwin
--

CREATE INDEX notification_histories_sent_at_idx ON public.notification_histories USING btree (sent_at);


--
-- Name: post_collections_collected_at_idx; Type: INDEX; Schema: public; Owner: psytwin
--

CREATE INDEX post_collections_collected_at_idx ON public.post_collections USING btree (collected_at);


--
-- Name: post_collections_post_id_idx; Type: INDEX; Schema: public; Owner: psytwin
--

CREATE INDEX post_collections_post_id_idx ON public.post_collections USING btree (post_id);


--
-- Name: post_collections_post_id_student_id_key; Type: INDEX; Schema: public; Owner: psytwin
--

CREATE UNIQUE INDEX post_collections_post_id_student_id_key ON public.post_collections USING btree (post_id, student_id);


--
-- Name: post_collections_student_id_idx; Type: INDEX; Schema: public; Owner: psytwin
--

CREATE INDEX post_collections_student_id_idx ON public.post_collections USING btree (student_id);


--
-- Name: post_likes_created_at_idx; Type: INDEX; Schema: public; Owner: psytwin
--

CREATE INDEX post_likes_created_at_idx ON public.post_likes USING btree (created_at);


--
-- Name: post_likes_post_id_idx; Type: INDEX; Schema: public; Owner: psytwin
--

CREATE INDEX post_likes_post_id_idx ON public.post_likes USING btree (post_id);


--
-- Name: post_likes_post_id_student_id_key; Type: INDEX; Schema: public; Owner: psytwin
--

CREATE UNIQUE INDEX post_likes_post_id_student_id_key ON public.post_likes USING btree (post_id, student_id);


--
-- Name: post_likes_student_id_idx; Type: INDEX; Schema: public; Owner: psytwin
--

CREATE INDEX post_likes_student_id_idx ON public.post_likes USING btree (student_id);


--
-- Name: posts_author_id_idx; Type: INDEX; Schema: public; Owner: psytwin
--

CREATE INDEX posts_author_id_idx ON public.posts USING btree (author_id);


--
-- Name: posts_created_at_idx; Type: INDEX; Schema: public; Owner: psytwin
--

CREATE INDEX posts_created_at_idx ON public.posts USING btree (created_at);


--
-- Name: psych_profiles_student_id_idx; Type: INDEX; Schema: public; Owner: psytwin
--

CREATE INDEX psych_profiles_student_id_idx ON public.psych_profiles USING btree (student_id);


--
-- Name: psych_profiles_student_id_key; Type: INDEX; Schema: public; Owner: psytwin
--

CREATE UNIQUE INDEX psych_profiles_student_id_key ON public.psych_profiles USING btree (student_id);


--
-- Name: room_devices_device_id_idx; Type: INDEX; Schema: public; Owner: psytwin
--

CREATE INDEX room_devices_device_id_idx ON public.room_devices USING btree (device_id);


--
-- Name: room_devices_room_id_device_id_key; Type: INDEX; Schema: public; Owner: psytwin
--

CREATE UNIQUE INDEX room_devices_room_id_device_id_key ON public.room_devices USING btree (room_id, device_id);


--
-- Name: room_devices_room_id_idx; Type: INDEX; Schema: public; Owner: psytwin
--

CREATE INDEX room_devices_room_id_idx ON public.room_devices USING btree (room_id);


--
-- Name: schedules_day_of_week_idx; Type: INDEX; Schema: public; Owner: psytwin
--

CREATE INDEX schedules_day_of_week_idx ON public.schedules USING btree (day_of_week);


--
-- Name: schedules_teacher_id_idx; Type: INDEX; Schema: public; Owner: psytwin
--

CREATE INDEX schedules_teacher_id_idx ON public.schedules USING btree (teacher_id);


--
-- Name: student_notifications_created_at_idx; Type: INDEX; Schema: public; Owner: psytwin
--

CREATE INDEX student_notifications_created_at_idx ON public.student_notifications USING btree (created_at);


--
-- Name: student_notifications_is_read_idx; Type: INDEX; Schema: public; Owner: psytwin
--

CREATE INDEX student_notifications_is_read_idx ON public.student_notifications USING btree (is_read);


--
-- Name: student_notifications_student_id_idx; Type: INDEX; Schema: public; Owner: psytwin
--

CREATE INDEX student_notifications_student_id_idx ON public.student_notifications USING btree (student_id);


--
-- Name: student_notifications_type_idx; Type: INDEX; Schema: public; Owner: psytwin
--

CREATE INDEX student_notifications_type_idx ON public.student_notifications USING btree (type);


--
-- Name: students_class_name_idx; Type: INDEX; Schema: public; Owner: psytwin
--

CREATE INDEX students_class_name_idx ON public.students USING btree (class_name);


--
-- Name: students_faculty_id_idx; Type: INDEX; Schema: public; Owner: psytwin
--

CREATE INDEX students_faculty_id_idx ON public.students USING btree (faculty_id);


--
-- Name: students_phone_key; Type: INDEX; Schema: public; Owner: psytwin
--

CREATE UNIQUE INDEX students_phone_key ON public.students USING btree (phone);


--
-- Name: students_risk_level_idx; Type: INDEX; Schema: public; Owner: psytwin
--

CREATE INDEX students_risk_level_idx ON public.students USING btree (risk_level);


--
-- Name: students_student_no_key; Type: INDEX; Schema: public; Owner: psytwin
--

CREATE UNIQUE INDEX students_student_no_key ON public.students USING btree (student_no);


--
-- Name: sync_logs_task_id_started_at_idx; Type: INDEX; Schema: public; Owner: psytwin
--

CREATE INDEX sync_logs_task_id_started_at_idx ON public.sync_logs USING btree (task_id, started_at);


--
-- Name: system_config_key_key; Type: INDEX; Schema: public; Owner: psytwin
--

CREATE UNIQUE INDEX system_config_key_key ON public.system_config USING btree (key);


--
-- Name: teachers_phone_key; Type: INDEX; Schema: public; Owner: psytwin
--

CREATE UNIQUE INDEX teachers_phone_key ON public.teachers USING btree (phone);


--
-- Name: teachers_role_idx; Type: INDEX; Schema: public; Owner: psytwin
--

CREATE INDEX teachers_role_idx ON public.teachers USING btree (role);


--
-- Name: teachers_status_idx; Type: INDEX; Schema: public; Owner: psytwin
--

CREATE INDEX teachers_status_idx ON public.teachers USING btree (status);


--
-- Name: teachers_teacher_id_key; Type: INDEX; Schema: public; Owner: psytwin
--

CREATE UNIQUE INDEX teachers_teacher_id_key ON public.teachers USING btree (teacher_id);


--
-- Name: timeline_events_status_idx; Type: INDEX; Schema: public; Owner: psytwin
--

CREATE INDEX timeline_events_status_idx ON public.timeline_events USING btree (status);


--
-- Name: timeline_events_student_id_idx; Type: INDEX; Schema: public; Owner: psytwin
--

CREATE INDEX timeline_events_student_id_idx ON public.timeline_events USING btree (student_id);


--
-- Name: users_email_key; Type: INDEX; Schema: public; Owner: psytwin
--

CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);


--
-- Name: users_role_idx; Type: INDEX; Schema: public; Owner: psytwin
--

CREATE INDEX users_role_idx ON public.users USING btree (role);


--
-- Name: users_status_idx; Type: INDEX; Schema: public; Owner: psytwin
--

CREATE INDEX users_status_idx ON public.users USING btree (status);


--
-- Name: vital_signs_student_id_idx; Type: INDEX; Schema: public; Owner: psytwin
--

CREATE INDEX vital_signs_student_id_idx ON public.vital_signs USING btree (student_id);


--
-- Name: vital_signs_student_id_timestamp_idx; Type: INDEX; Schema: public; Owner: psytwin
--

CREATE INDEX vital_signs_student_id_timestamp_idx ON public.vital_signs USING btree (student_id, "timestamp");


--
-- Name: vital_signs_timestamp_idx; Type: INDEX; Schema: public; Owner: psytwin
--

CREATE INDEX vital_signs_timestamp_idx ON public.vital_signs USING btree ("timestamp");


--
-- Name: voice_analyses_sentiment_idx; Type: INDEX; Schema: public; Owner: psytwin
--

CREATE INDEX voice_analyses_sentiment_idx ON public.voice_analyses USING btree (sentiment);


--
-- Name: voice_analyses_student_id_idx; Type: INDEX; Schema: public; Owner: psytwin
--

CREATE INDEX voice_analyses_student_id_idx ON public.voice_analyses USING btree (student_id);


--
-- Name: voice_analyses_student_id_timestamp_idx; Type: INDEX; Schema: public; Owner: psytwin
--

CREATE INDEX voice_analyses_student_id_timestamp_idx ON public.voice_analyses USING btree (student_id, "timestamp");


--
-- Name: voice_analyses_timestamp_idx; Type: INDEX; Schema: public; Owner: psytwin
--

CREATE INDEX voice_analyses_timestamp_idx ON public.voice_analyses USING btree ("timestamp");


--
-- Name: vr_scenes_name_key; Type: INDEX; Schema: public; Owner: psytwin
--

CREATE UNIQUE INDEX vr_scenes_name_key ON public.vr_scenes USING btree (name);


--
-- Name: vr_sessions_scene_id_idx; Type: INDEX; Schema: public; Owner: psytwin
--

CREATE INDEX vr_sessions_scene_id_idx ON public.vr_sessions USING btree (scene_id);


--
-- Name: vr_sessions_session_at_idx; Type: INDEX; Schema: public; Owner: psytwin
--

CREATE INDEX vr_sessions_session_at_idx ON public.vr_sessions USING btree (session_at);


--
-- Name: vr_sessions_student_id_idx; Type: INDEX; Schema: public; Owner: psytwin
--

CREATE INDEX vr_sessions_student_id_idx ON public.vr_sessions USING btree (student_id);


--
-- Name: warnings_assigned_to_idx; Type: INDEX; Schema: public; Owner: psytwin
--

CREATE INDEX warnings_assigned_to_idx ON public.warnings USING btree (assigned_to);


--
-- Name: warnings_riskLevel_idx; Type: INDEX; Schema: public; Owner: psytwin
--

CREATE INDEX "warnings_riskLevel_idx" ON public.warnings USING btree ("riskLevel");


--
-- Name: warnings_status_idx; Type: INDEX; Schema: public; Owner: psytwin
--

CREATE INDEX warnings_status_idx ON public.warnings USING btree (status);


--
-- Name: warnings_student_id_idx; Type: INDEX; Schema: public; Owner: psytwin
--

CREATE INDEX warnings_student_id_idx ON public.warnings USING btree (student_id);


--
-- Name: work_orders_date_idx; Type: INDEX; Schema: public; Owner: psytwin
--

CREATE INDEX work_orders_date_idx ON public.work_orders USING btree (date);


--
-- Name: work_orders_risk_level_idx; Type: INDEX; Schema: public; Owner: psytwin
--

CREATE INDEX work_orders_risk_level_idx ON public.work_orders USING btree (risk_level);


--
-- Name: work_orders_status_idx; Type: INDEX; Schema: public; Owner: psytwin
--

CREATE INDEX work_orders_status_idx ON public.work_orders USING btree (status);


--
-- Name: work_orders_student_id_idx; Type: INDEX; Schema: public; Owner: psytwin
--

CREATE INDEX work_orders_student_id_idx ON public.work_orders USING btree (student_id);


--
-- Name: alerts alerts_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: psytwin
--

ALTER TABLE ONLY public.alerts
    ADD CONSTRAINT alerts_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: appointments appointments_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: psytwin
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: appointments appointments_teacher_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: psytwin
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_teacher_id_fkey FOREIGN KEY (teacher_id) REFERENCES public.teachers(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: chat_messages chat_messages_session_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: psytwin
--

ALTER TABLE ONLY public.chat_messages
    ADD CONSTRAINT chat_messages_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.chat_sessions(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: chat_sessions chat_sessions_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: psytwin
--

ALTER TABLE ONLY public.chat_sessions
    ADD CONSTRAINT chat_sessions_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: comments comments_author_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: psytwin
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.students(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: comments comments_post_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: psytwin
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.posts(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: consultation_rooms consultation_rooms_current_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: psytwin
--

ALTER TABLE ONLY public.consultation_rooms
    ADD CONSTRAINT consultation_rooms_current_student_id_fkey FOREIGN KEY (current_student_id) REFERENCES public.students(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: expression_data expression_data_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: psytwin
--

ALTER TABLE ONLY public.expression_data
    ADD CONSTRAINT expression_data_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: intervention_details intervention_details_record_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: psytwin
--

ALTER TABLE ONLY public.intervention_details
    ADD CONSTRAINT intervention_details_record_id_fkey FOREIGN KEY (record_id) REFERENCES public.intervention_records(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: intervention_records intervention_records_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: psytwin
--

ALTER TABLE ONLY public.intervention_records
    ADD CONSTRAINT intervention_records_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: notification_histories notification_histories_rule_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: psytwin
--

ALTER TABLE ONLY public.notification_histories
    ADD CONSTRAINT notification_histories_rule_id_fkey FOREIGN KEY (rule_id) REFERENCES public.notification_rules(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: post_collections post_collections_post_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: psytwin
--

ALTER TABLE ONLY public.post_collections
    ADD CONSTRAINT post_collections_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.posts(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: post_collections post_collections_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: psytwin
--

ALTER TABLE ONLY public.post_collections
    ADD CONSTRAINT post_collections_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: post_likes post_likes_post_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: psytwin
--

ALTER TABLE ONLY public.post_likes
    ADD CONSTRAINT post_likes_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.posts(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: post_likes post_likes_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: psytwin
--

ALTER TABLE ONLY public.post_likes
    ADD CONSTRAINT post_likes_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: posts posts_author_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: psytwin
--

ALTER TABLE ONLY public.posts
    ADD CONSTRAINT posts_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.students(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: psych_profiles psych_profiles_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: psytwin
--

ALTER TABLE ONLY public.psych_profiles
    ADD CONSTRAINT psych_profiles_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: room_devices room_devices_device_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: psytwin
--

ALTER TABLE ONLY public.room_devices
    ADD CONSTRAINT room_devices_device_id_fkey FOREIGN KEY (device_id) REFERENCES public.devices(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: room_devices room_devices_room_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: psytwin
--

ALTER TABLE ONLY public.room_devices
    ADD CONSTRAINT room_devices_room_id_fkey FOREIGN KEY (room_id) REFERENCES public.consultation_rooms(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: student_notifications student_notifications_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: psytwin
--

ALTER TABLE ONLY public.student_notifications
    ADD CONSTRAINT student_notifications_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: students students_faculty_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: psytwin
--

ALTER TABLE ONLY public.students
    ADD CONSTRAINT students_faculty_id_fkey FOREIGN KEY (faculty_id) REFERENCES public.faculties(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: sync_logs sync_logs_task_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: psytwin
--

ALTER TABLE ONLY public.sync_logs
    ADD CONSTRAINT sync_logs_task_id_fkey FOREIGN KEY (task_id) REFERENCES public.sync_tasks(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: sync_tasks sync_tasks_data_source_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: psytwin
--

ALTER TABLE ONLY public.sync_tasks
    ADD CONSTRAINT sync_tasks_data_source_id_fkey FOREIGN KEY (data_source_id) REFERENCES public.data_sources(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: timeline_events timeline_events_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: psytwin
--

ALTER TABLE ONLY public.timeline_events
    ADD CONSTRAINT timeline_events_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: vital_signs vital_signs_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: psytwin
--

ALTER TABLE ONLY public.vital_signs
    ADD CONSTRAINT vital_signs_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: voice_analyses voice_analyses_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: psytwin
--

ALTER TABLE ONLY public.voice_analyses
    ADD CONSTRAINT voice_analyses_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: vr_sessions vr_sessions_scene_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: psytwin
--

ALTER TABLE ONLY public.vr_sessions
    ADD CONSTRAINT vr_sessions_scene_id_fkey FOREIGN KEY (scene_id) REFERENCES public.vr_scenes(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: vr_sessions vr_sessions_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: psytwin
--

ALTER TABLE ONLY public.vr_sessions
    ADD CONSTRAINT vr_sessions_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: warnings warnings_assigned_to_fkey; Type: FK CONSTRAINT; Schema: public; Owner: psytwin
--

ALTER TABLE ONLY public.warnings
    ADD CONSTRAINT warnings_assigned_to_fkey FOREIGN KEY (assigned_to) REFERENCES public.teachers(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: warnings warnings_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: psytwin
--

ALTER TABLE ONLY public.warnings
    ADD CONSTRAINT warnings_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: work_orders work_orders_student_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: psytwin
--

ALTER TABLE ONLY public.work_orders
    ADD CONSTRAINT work_orders_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: psytwin
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


--
-- PostgreSQL database dump complete
--

\unrestrict rmrt98DMxGir68qyX0VIwZbzmqSx8fuRbUpp4ex8oJTpnqwI19y9jwdX7Bi3qws

